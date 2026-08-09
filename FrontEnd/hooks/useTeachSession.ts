'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { createTeachSession, teachWebSocketUrl } from '@/lib/games/teach/api';
import { TeachAudioCapture } from '@/lib/games/teach/audio-capture';
import { TeachAudioPlayback } from '@/lib/games/teach/audio-playback';
import { normalizeTeachEventType, TeachSocket } from '@/lib/games/teach/socket';
import type { TeachConnectionPhase, TeachGrade, TeachMessage, TeachResult } from '@/lib/games/teach/types';

export type { TeachPhase } from '@/lib/games/teach/types';

function normalizeGrade(grade: TeachGrade): TeachResult {
  const score = grade.score <= 1 ? Math.round(grade.score * 100) : Math.round(grade.score);
  const feedback = typeof grade.feedback === 'string'
    ? { correct_points: grade.strengths ?? [], missing_points: grade.misconceptions ?? [], incorrect_points: [], praise_or_tip: grade.feedback }
    : grade.feedback;
  return {
    accuracy_percent: score,
    band: score >= 95 ? 'bullseye' : score >= 90 ? 'great' : score >= 70 ? 'good' : 'miss',
    xp_earned: grade.xp_awarded,
    feedback,
    correct_answer: grade.correct_answer ?? 'A strong explanation defines the idea, explains how it works, and gives a useful example.',
  };
}

function isQnaCompleteCue(text: string) {
  const normalized = text.toLowerCase();
  return normalized.includes("that's everything") || normalized.includes('that is everything') || normalized.includes('thank you for teaching me') || normalized.includes('no more questions') || normalized.includes('done asking');
}

export function useTeachSession() {
  const [phase, setPhaseState] = useState<TeachConnectionPhase>('idle');
  const [messages, setMessages] = useState<TeachMessage[]>([]);
  const [result, setResult] = useState<TeachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyNotice, setHistoryNotice] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [qnaExchangeCount, setQnaExchangeCount] = useState(0);
  const [qnaReady, setQnaReady] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [commitNotice, setCommitNotice] = useState(false);
  const phaseRef = useRef<TeachConnectionPhase>('idle');
  const isAnsweringRef = useRef(false);
  const gradeRef = useRef<TeachResult | null>(null);
  const socketRef = useRef<TeachSocket | null>(null);
  const captureRef = useRef(new TeachAudioCapture());
  const playbackRef = useRef(new TeachAudioPlayback());
  const chatSessionIdRef = useRef<string | null>(null);
  const leavingRef = useRef(false);
  const streamingCompanionIdRef = useRef<string | null>(null);
  const streamingUserIdRef = useRef<string | null>(null);
  const lastUserTextRef = useRef<string | null>(null);
  const lastCompanionTextRef = useRef<{ text: string; at: number } | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const commitTimerRef = useRef<number | null>(null);
  const connectGenerationRef = useRef(0);
  const activeLessonRef = useRef<string | null>(null);

  const debug = process.env.NEXT_PUBLIC_DEBUG_TEACH === 'true';
  const setPhase = useCallback((next: TeachConnectionPhase) => {
    if (debug) {
      const message = `🦊 STATE → ${next} (from ${phaseRef.current})`;
      if (next === 'grading' || next === 'result' || next === 'failed') console.trace(message);
      else console.log(message);
    }
    phaseRef.current = next;
    setPhaseState(next);
  }, [debug]);

  const sendSocket = useCallback((socket: TeachSocket, payload: object) => {
    if (debug && typeof payload === 'object' && payload !== null && 'type' in payload) {
      console.log('🦊 WS SEND:', (payload as { type: string }).type);
    }
    socket.send(payload);
  }, [debug]);

  const cleanupAudio = useCallback(async () => {
    if (debug) console.trace('🦊 MIC STOP (local audio cleanup only)');
    isAnsweringRef.current = false;
    setIsAnswering(false);
    setRecordingSeconds(0);
    await captureRef.current.stop();
    await playbackRef.current.stop();
  }, [debug]);

  const finishWithGrade = useCallback((grade: TeachGrade, fromHistory = false) => {
    const normalized = normalizeGrade(grade);
    gradeRef.current = normalized;
    activeLessonRef.current = null;
    setResult(normalized);
    setHistoryNotice(fromHistory);
    setPhase('result');
  }, [setPhase]);

  const connect = useCallback(async (lessonId: string) => {
    if (activeLessonRef.current === lessonId) return;
    activeLessonRef.current = lessonId;
    const generation = ++connectGenerationRef.current;
    leavingRef.current = false;
    gradeRef.current = null;
    streamingCompanionIdRef.current = null;
    streamingUserIdRef.current = null;
    lastUserTextRef.current = null;
    lastCompanionTextRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
    setError(null);
    setHistoryNotice(false);
    setResult(null);
    setMessages([]);
    setQnaExchangeCount(0);
    setQnaReady(false);
    setCommitNotice(false);
    setRecordingSeconds(0);
    isAnsweringRef.current = false;
    setIsAnswering(false);
    setPhase('connecting');

    try {
      const session = await createTeachSession(lessonId);
      if (generation !== connectGenerationRef.current || leavingRef.current) return;
      chatSessionIdRef.current = session.chat_session_id;
      setChatSessionId(session.chat_session_id);
      const socket = new TeachSocket(teachWebSocketUrl(session.ticket), {
        open: async () => {
          try {
            await captureRef.current.start((audio) => {
              const canSend = phaseRef.current === 'explaining' || (phaseRef.current === 'qna' && isAnsweringRef.current);
              if (canSend) sendSocket(socket, { type: 'input_audio_buffer.append', audio });
            });
            isAnsweringRef.current = true;
            setIsAnswering(true);
            recordingStartedAtRef.current = Date.now();
            setRecordingSeconds(0);
            setPhase('explaining');
          } catch {
            setError('Microphone permission is required to teach your companion.');
            setPhase('failed');
          }
        },
        message: (payload) => {
          const type = typeof payload.type === 'string' ? payload.type : '';
          const canonical = normalizeTeachEventType(type);
          if (debug) console.log('🦊 WS RECV:', type, '→', canonical, payload);

          if (canonical === 'ai_audio_delta') {
            const audio = typeof payload.delta === 'string' ? payload.delta : typeof payload.audio === 'string' ? payload.audio : '';
            if (audio) playbackRef.current.play(audio);
            return;
          }
          if (canonical === 'ai_audio_done' || canonical === 'ai_response_created') return;

          if (canonical === 'ai_response_done') {
            // This ends one AI response, never the teaching session.
            return;
          }

          if (canonical === 'user_text_delta') {
            const chunk = typeof payload.delta === 'string' ? payload.delta : typeof payload.transcript === 'string' ? payload.transcript : '';
            if (!chunk) return;
            setMessages((current) => {
              const id = streamingUserIdRef.current ?? `user-${Date.now()}`;
              streamingUserIdRef.current = id;
              const index = current.findIndex((message) => message.id === id);
              if (index < 0) return [...current, { id, sender: 'user', text: chunk, streaming: true }];
              return current.map((message, itemIndex) => itemIndex === index ? { ...message, text: `${message.text}${chunk}` } : message);
            });
            return;
          }

          if (canonical === 'user_text_done') {
            const text = typeof payload.transcript === 'string' ? payload.transcript.trim() : typeof payload.text === 'string' ? payload.text.trim() : '';
            if (text) {
              const hadStreamingBubble = Boolean(streamingUserIdRef.current);
              if (!hadStreamingBubble && lastUserTextRef.current === text) return;
              setMessages((current) => {
                const id = streamingUserIdRef.current ?? `user-${Date.now()}`;
                streamingUserIdRef.current = null;
                const index = current.findIndex((message) => message.id === id);
                if (index < 0) {
                  return [...current, { id, sender: 'user', text, streaming: false }];
                }
                return current.map((message, itemIndex) => itemIndex === index ? { ...message, text, streaming: false } : message);
              });
              lastUserTextRef.current = text;
              if (phaseRef.current === 'qna') setQnaExchangeCount((count) => count + 1);
            }
            return;
          }

          if (canonical === 'ai_text_delta') {
            const chunk = typeof payload.delta === 'string' ? payload.delta : typeof payload.transcript === 'string' ? payload.transcript : '';
            if (!chunk) return;
            setMessages((current) => {
              const id = streamingCompanionIdRef.current ?? `companion-${Date.now()}`;
              streamingCompanionIdRef.current = id;
              const index = current.findIndex((message) => message.id === id);
              if (index < 0) return [...current, { id, sender: 'companion', text: chunk, streaming: true }];
              return current.map((message, itemIndex) => itemIndex === index ? { ...message, text: `${message.text}${chunk}` } : message);
            });
            return;
          }

          if (canonical === 'ai_text_done') {
            const finalText = typeof payload.transcript === 'string' ? payload.transcript.trim() : typeof payload.text === 'string' ? payload.text.trim() : '';
            const id = streamingCompanionIdRef.current;
            if (id) {
              setMessages((current) => current.map((message) => message.id === id ? { ...message, text: finalText || message.text, streaming: false } : message));
              streamingCompanionIdRef.current = null;
            } else if (finalText) {
              const previous = lastCompanionTextRef.current;
              if (!previous || previous.text !== finalText || Date.now() - previous.at > 5000) {
                setMessages((current) => [...current, { id: `companion-${Date.now()}`, sender: 'companion', text: finalText, streaming: false }]);
              }
            }
            if (finalText) lastCompanionTextRef.current = { text: finalText, at: Date.now() };
            if (phaseRef.current === 'awaiting_qna') setPhase('qna');
            if (finalText && isQnaCompleteCue(finalText)) setQnaReady(true);
            return;
          }

          if (canonical === 'qna_complete') {
            setQnaReady(true);
            if (phaseRef.current === 'awaiting_qna') setPhase('qna');
            return;
          }

          if (canonical === 'teach.grading_started') { void cleanupAudio(); setPhase('grading'); return; }
          if (canonical === 'teach.grade') { finishWithGrade((payload.data ?? payload) as TeachGrade); return; }
          if (canonical === 'teach.grade_failed') {
            console.error('🦊 teach.grade_failed:', payload);
            setError(typeof payload.message === 'string' ? payload.message : typeof payload.detail === 'string' ? payload.detail : 'Grading failed.');
            activeLessonRef.current = null;
            setPhase('failed');
            return;
          }
          if (canonical === 'session_ended' || canonical === 'response_cancelled') {
            const detail = typeof payload.reason === 'string' ? payload.reason : `${type} received`;
            console.error('🦊 WS lifecycle event:', type, detail);
            setError(`Teaching session ended unexpectedly: ${detail}`);
            activeLessonRef.current = null;
            setPhase('failed');
            return;
          }
          if (canonical === 'error') {
            setError(typeof payload.message === 'string' ? payload.message : typeof payload.detail === 'string' ? payload.detail : 'Something went wrong with the teaching session.');
            activeLessonRef.current = null;
            setPhase('failed');
          }
        },
        error: () => setError('The teaching session could not connect. Please try again.'),
        close: (event) => {
          void cleanupAudio();
          if (debug) console.log('🦊 WS CLOSED code:', event.code, 'reason:', event.reason);
          if (socketRef.current === socket) socketRef.current = null;
          activeLessonRef.current = null;
          const clientInitiated = event.code === 1000 && ['component unmount', 'cancelled before use', 'user leaving', 'session complete'].includes(event.reason);
          if (leavingRef.current || clientInitiated || gradeRef.current || phaseRef.current === 'grading' || phaseRef.current === 'result') return;
          setError(`Connection closed unexpectedly (code ${event.code}). ${event.reason || 'Please try again.'}`);
          setPhase('failed');
        },
      });
      socketRef.current = socket;
      socket.open();
    } catch (caught) {
      activeLessonRef.current = null;
      setError(caught instanceof ApiError && caught.status === 404 ? 'This teaching lesson could not be found.' : 'Could not start the teaching session.');
      setPhase('failed');
    }
  }, [cleanupAudio, debug, finishWithGrade, sendSocket, setPhase]);

  const endExplanation = useCallback(() => {
    if (phaseRef.current !== 'explaining') return;
    const socket = socketRef.current;
    if (!socket) return;
    sendSocket(socket, { type: 'input_audio_buffer.commit' });
    sendSocket(socket, { type: 'end_explanation' });
    isAnsweringRef.current = false;
    setIsAnswering(false);
    setPhase('awaiting_qna');
  }, [sendSocket, setPhase]);

  const toggleRecording = useCallback(() => {
    if (phaseRef.current !== 'explaining' && phaseRef.current !== 'qna') return;
    const socket = socketRef.current;
    if (!socket) return;
    const next = !isAnsweringRef.current;
    isAnsweringRef.current = next;
    setIsAnswering(next);
    setCommitNotice(false);
    if (next) {
      recordingStartedAtRef.current = Date.now();
      setRecordingSeconds(0);
    } else {
      sendSocket(socket, { type: 'input_audio_buffer.commit' });
      setRecordingSeconds(0);
      if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
      setCommitNotice(true);
      commitTimerRef.current = window.setTimeout(() => setCommitNotice(false), 1800);
    }
  }, [sendSocket]);

  const endTeaching = useCallback(() => {
    if (debug) console.log('🦊 sendEndTeaching called from:', 'user_click', 'state:', phaseRef.current);
    if (phaseRef.current !== 'qna' || qnaExchangeCount < 1) {
      if (debug) console.warn('🦊 BLOCKED: end_teaching only allowed in qna after an answer');
      return;
    }
    const socket = socketRef.current;
    if (!socket) return;
    sendSocket(socket, { type: 'end_teaching' });
    isAnsweringRef.current = false;
    setIsAnswering(false);
    setPhase('grading');
  }, [debug, qnaExchangeCount, sendSocket, setPhase]);

  const close = useCallback(() => {
    leavingRef.current = true;
    connectGenerationRef.current += 1;
    activeLessonRef.current = null;
    if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
    if (debug) console.trace('🦊 STOP CALLED (WS close only)');
    socketRef.current?.close(1000, 'component unmount');
    socketRef.current = null;
    void cleanupAudio();
  }, [cleanupAudio, debug]);

  useEffect(() => {
    if (!isAnswering) return undefined;
    const timer = window.setInterval(() => {
      const startedAt = recordingStartedAtRef.current;
      if (startedAt) setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [isAnswering]);

  return { phase, messages, result, error, historyNotice, chatSessionId, isRecording: isAnswering, qnaExchangeCount, qnaReady, recordingSeconds, commitNotice, connect, endExplanation, toggleRecording, endTeaching, close };
}
