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

function friendlyError(raw: string) {
  if (/missing required parameter/i.test(raw)) return 'Teaching service is temporarily unavailable. Please try again in a moment.';
  if (/rate limit/i.test(raw)) return 'Too many sessions right now. Please wait a moment and try again.';
  if (/timeout/i.test(raw)) return 'Connection timed out. Check your internet and try again.';
  if (/authentication|unauthorized|invalid ticket|expired/i.test(raw)) return 'Session expired. Please start a new teaching session.';
  return raw;
}

function isRetryableError(raw: string) {
  return /missing required parameter|rate limit|timeout|authentication|unauthorized|invalid ticket|expired/i.test(raw);
}

export function useTeachSession() {
  const [phase, setPhaseState] = useState<TeachConnectionPhase>('idle');
  const [messages, setMessages] = useState<TeachMessage[]>([]);
  const [result, setResult] = useState<TeachResult | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [historyNotice, setHistoryNotice] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [qnaExchangeCount, setQnaExchangeCount] = useState(0);
  const [qnaQuestionCount, setQnaQuestionCount] = useState(0);
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
  const lastLessonRef = useRef<string | null>(null);
  const autoRetryAttemptRef = useRef(0);
  const connectRef = useRef<(lessonId: string, preserveAutoRetry?: boolean) => void>(() => undefined);

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

  const endSession = useCallback((source: string, reason: string) => {
    console.trace(`🦊 endSession called from: ${source}, reason: ${reason}`);
    socketRef.current?.close(1000, reason);
    socketRef.current = null;
  }, []);

  const setTeachError = useCallback((raw: string, payload?: unknown) => {
    const trimmed = (raw ?? '').trim();
    if (!trimmed) {
      if (debug) console.log('🦊 setTeachError: ignoring empty payload', payload);
      return;
    }
    const friendly = friendlyError(trimmed);
    console.error('🦊 teach error:', { raw: trimmed, friendly, payload });
    setRawError(trimmed);
    setErrorDetail(friendly);
    void playbackRef.current.stop();
    if (isRetryableError(trimmed) && autoRetryAttemptRef.current === 0) {
      autoRetryAttemptRef.current = 1;
      setRetryCountdown(3);
    }
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
    void playbackRef.current.stop();
    setResult(normalized);
    setHistoryNotice(fromHistory);
    setPhase('result');
  }, [setPhase]);

  const connect = useCallback(async (lessonId: string, preserveAutoRetry = false) => {
    if (activeLessonRef.current === lessonId) return;
    lastLessonRef.current = lessonId;
    if (!preserveAutoRetry) autoRetryAttemptRef.current = 0;
    activeLessonRef.current = lessonId;
    const generation = ++connectGenerationRef.current;
    leavingRef.current = false;
    gradeRef.current = null;
    streamingCompanionIdRef.current = null;
    streamingUserIdRef.current = null;
    lastUserTextRef.current = null;
    lastCompanionTextRef.current = null;
    if (socketRef.current) endSession('new session connection', 'component unmount');
    setErrorDetail(null);
    setRawError(null);
    setRetryCountdown(null);
    setHistoryNotice(false);
    setResult(null);
    setMessages([]);
    setQnaExchangeCount(0);
    setQnaQuestionCount(0);
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
            setTeachError('Microphone permission is required to teach your companion.', {});
            setPhase('failed');
          }
        },
        message: (payload) => {
          const type = typeof payload.type === 'string' ? payload.type : '';
          const canonical = normalizeTeachEventType(type);
          if (debug) console.log('🦊 WS RECV:', type, '→ canonical:', canonical, 'payload:', payload);

          if (canonical === 'ai_audio_delta') {
            const audio = typeof payload.delta === 'string' ? payload.delta : typeof payload.audio === 'string' ? payload.audio : '';
            if (audio) playbackRef.current.play(audio);
            return;
          }
          if (canonical === 'ai_audio_done' || canonical === 'ai_response_created') return;

          if (canonical === 'ai_response_done') {
            // This ends one AI response, never the teaching session.
            streamingCompanionIdRef.current = null;
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
              setMessages((current) => {
                const last = current[current.length - 1];
                if (last?.sender === 'user' && last.text.trim() === text) {
                  console.log('🦊 Dropped duplicate user bubble');
                  streamingUserIdRef.current = null;
                  return current;
                }
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
            const finalText = typeof payload.transcript === 'string' ? payload.transcript : typeof payload.text === 'string' ? payload.text : '';
            const id = streamingCompanionIdRef.current;
            if (id) {
              setMessages((current) => current.map((message) => message.id === id ? { ...message, text: finalText || message.text, streaming: false } : message));
              streamingCompanionIdRef.current = null;
            } else if (finalText) {
              setMessages((current) => {
                const last = current[current.length - 1];
                if (last?.sender === 'companion' && last.text.trim() === finalText.trim()) return current;
                return [...current, { id: crypto.randomUUID(), sender: 'companion', text: finalText, streaming: false }];
              });
            }
            if (finalText) lastCompanionTextRef.current = { text: finalText, at: Date.now() };
            if (phaseRef.current === 'awaiting_qna') setPhase('qna');
            if (finalText.trim() && (phaseRef.current === 'awaiting_qna' || phaseRef.current === 'qna')) {
              setQnaQuestionCount((count) => count + 1);
            }
            if (finalText && isQnaCompleteCue(finalText)) setQnaReady(true);
            return;
          }

          if (canonical === 'qna_complete') {
            setQnaReady(true);
            if (phaseRef.current === 'awaiting_qna') setPhase('qna');
            return;
          }

          if (canonical === 'teach.grade') { finishWithGrade((payload.data ?? payload) as TeachGrade); return; }
          if (canonical === 'teach.grade_failed' || canonical === 'grade_failed') {
            const message =
              (typeof payload.message === 'string' && payload.message.trim()) ||
              (typeof payload.detail === 'string' && payload.detail.trim()) ||
              '';
            if (!message) {
              console.log('🦊 ignored empty grade_failed event:', payload);
              return;
            }
            console.error('🦊 teach.grade_failed:', payload);
            setTeachError(message, payload);
            activeLessonRef.current = null;
            setPhase('failed');
            return;
          }
          if (canonical === 'error') {
            const message =
              (typeof payload.message === 'string' && payload.message.trim()) ||
              (typeof payload.detail === 'string' && payload.detail.trim()) ||
              (typeof payload.error === 'string' && payload.error.trim()) ||
              (typeof payload.error === 'object' && payload.error !== null && 'message' in payload.error && typeof payload.error.message === 'string' ? payload.error.message.trim() : '') ||
              '';
            if (!message) {
              if (debug) console.log('🦊 ignored empty error event:', payload);
              return;
            }
            setTeachError(message, payload);
            activeLessonRef.current = null;
            setPhase('failed');
          }
        },
        error: () => setTeachError('The teaching session could not connect. Please try again.'),
        close: (event) => {
          void cleanupAudio();
          if (debug) console.log('🦊 WS CLOSED code:', event.code, 'reason:', event.reason);
          if (socketRef.current === socket) socketRef.current = null;
          const clientInitiated = event.code === 1000 && ['component unmount', 'cancelled before use', 'user leaving', 'session complete'].includes(event.reason);
          if (leavingRef.current || clientInitiated || gradeRef.current || phaseRef.current === 'grading' || phaseRef.current === 'result') return;
          if (phaseRef.current === 'explaining' || phaseRef.current === 'awaiting_qna' || phaseRef.current === 'qna') {
            setTeachError(`Connection closed unexpectedly (code ${event.code})${event.reason ? `: ${event.reason}` : ''}`, event);
            activeLessonRef.current = null;
            setPhase('failed');
          }
        },
      });
      socketRef.current = socket;
      socket.open();
    } catch (caught) {
      activeLessonRef.current = null;
      setTeachError(caught instanceof ApiError && caught.status === 404 ? 'This teaching lesson could not be found.' : 'Could not start the teaching session.', caught);
      setPhase('failed');
    }
  }, [cleanupAudio, debug, endSession, finishWithGrade, sendSocket, setPhase, setTeachError]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (retryCountdown === null) return undefined;
    if (retryCountdown === 0) {
      const timer = window.setTimeout(() => {
        setRetryCountdown(null);
        const lessonId = lastLessonRef.current;
        if (lessonId) {
          activeLessonRef.current = null;
          void connectRef.current(lessonId, true);
        }
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setRetryCountdown((count) => count === null ? null : count - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [retryCountdown]);

  const retry = useCallback(() => {
    const lessonId = lastLessonRef.current;
    if (!lessonId) return;
    autoRetryAttemptRef.current = 0;
    setRetryCountdown(null);
    activeLessonRef.current = null;
    void connect(lessonId);
  }, [connect]);

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
    if (phaseRef.current !== 'qna') {
      if (debug) console.warn('🦊 BLOCKED: end_teaching only allowed in qna');
      return;
    }
    const socket = socketRef.current;
    if (!socket) return;
    sendSocket(socket, { type: 'end_teaching' });
    isAnsweringRef.current = false;
    setIsAnswering(false);
    setPhase('grading');
  }, [debug, sendSocket, setPhase]);

  const close = useCallback((reason: 'component unmount' | 'user leaving' = 'component unmount') => {
    leavingRef.current = true;
    connectGenerationRef.current += 1;
    activeLessonRef.current = null;
    if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
    endSession(reason === 'user leaving' ? 'user navigation' : 'component unmount', reason);
    void cleanupAudio();
  }, [cleanupAudio, endSession]);

  useEffect(() => {
    if (!isAnswering) return undefined;
    const timer = window.setInterval(() => {
      const startedAt = recordingStartedAtRef.current;
      if (startedAt) setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [isAnswering]);

  return { phase, messages, result, error: errorDetail, errorDetail, rawError, retryCountdown, historyNotice, chatSessionId, isRecording: isAnswering, qnaExchangeCount, qnaQuestionCount, qnaReady, recordingSeconds, commitNotice, connect, retry, endExplanation, toggleRecording, endTeaching, close };
}
