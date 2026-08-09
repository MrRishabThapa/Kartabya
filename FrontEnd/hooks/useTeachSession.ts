'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { createTeachSession, getTeachGrade, teachWebSocketUrl } from '@/lib/games/teach/api';
import { TeachAudioCapture } from '@/lib/games/teach/audio-capture';
import { TeachAudioPlayback } from '@/lib/games/teach/audio-playback';
import { TeachSocket } from '@/lib/games/teach/socket';
import type { TeachConnectionPhase, TeachGrade, TeachMessage, TeachResult } from '@/lib/games/teach/types';

export type { TeachPhase } from '@/lib/games/teach/types';

function normalizeGrade(grade: TeachGrade): TeachResult {
  const score = grade.score <= 1 ? Math.round(grade.score * 100) : Math.round(grade.score);
  const feedback = typeof grade.feedback === 'string' ? { correct_points: grade.strengths ?? [], missing_points: grade.misconceptions ?? [], incorrect_points: [], praise_or_tip: grade.feedback } : grade.feedback;
  return {
    accuracy_percent: score,
    band: score >= 95 ? 'bullseye' : score >= 90 ? 'great' : score >= 70 ? 'good' : 'miss',
    xp_earned: grade.xp_awarded,
    feedback,
    correct_answer: grade.correct_answer ?? 'A strong explanation defines the idea, explains how it works, and gives a useful example.',
  };
}

export function useTeachSession() {
  const [phase, setPhase] = useState<TeachConnectionPhase>('idle');
  const [messages, setMessages] = useState<TeachMessage[]>([]);
  const [result, setResult] = useState<TeachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyNotice, setHistoryNotice] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const phaseRef = useRef(phase);
  const gradeRef = useRef<TeachResult | null>(null);
  const socketRef = useRef<TeachSocket | null>(null);
  const captureRef = useRef(new TeachAudioCapture());
  const playbackRef = useRef(new TeachAudioPlayback());
  const chatSessionIdRef = useRef<string | null>(null);
  const leavingRef = useRef(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const cleanupAudio = useCallback(async () => {
    await captureRef.current.stop();
    await playbackRef.current.stop();
  }, []);

  const finishWithGrade = useCallback((grade: TeachGrade, fromHistory = false) => {
    const normalized = normalizeGrade(grade);
    gradeRef.current = normalized;
    setResult(normalized);
    setHistoryNotice(fromHistory);
    setPhase('result');
  }, []);

  const connect = useCallback(async (lessonId: string) => {
    leavingRef.current = false;
    gradeRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
    setError(null);
    setHistoryNotice(false);
    setResult(null);
    setMessages([]);
    setPhase('connecting');
    try {
      const session = await createTeachSession(lessonId);
      chatSessionIdRef.current = session.chat_session_id;
      setChatSessionId(session.chat_session_id);
      const socket = new TeachSocket(teachWebSocketUrl(session.ticket), {
        open: async () => {
          try {
            await captureRef.current.start((audio) => {
              if (phaseRef.current === 'explaining') socket.send({ type: 'input_audio_buffer.append', audio });
            });
            setPhase('explaining');
          } catch {
            setError('Microphone permission is required to teach your companion.');
            setPhase('failed');
          }
        },
        message: (payload) => {
          const type = typeof payload.type === 'string' ? payload.type : '';
          if (type === 'response.audio.delta' && typeof payload.delta === 'string') { playbackRef.current.play(payload.delta); return; }
          if (type === 'conversation.item.input_audio_transcription.completed' && typeof payload.transcript === 'string') {
            const text = payload.transcript.trim();
            if (text) setMessages((current) => [...current, { id: `user-${Date.now()}`, sender: 'user', text }]);
            return;
          }
          if (type === 'response.output_audio_transcription.done' && typeof payload.transcript === 'string') {
            const text = payload.transcript.trim();
            if (text) setMessages((current) => [...current, { id: `companion-${Date.now()}`, sender: 'companion', text }]);
            return;
          }
          if (type === 'teach.grading_started') { void cleanupAudio(); setPhase('grading'); return; }
          if (type === 'teach.grade') { finishWithGrade((payload.data ?? payload) as TeachGrade); return; }
          if (type === 'teach.grade_failed' || type === 'error') { setError(typeof payload.message === 'string' ? payload.message : 'Teaching evaluation failed.'); setPhase('failed'); }
        },
        error: () => setError('The teaching session could not connect. Please try again.'),
        close: () => {
          void cleanupAudio();
          if (leavingRef.current || gradeRef.current) return;
          const sessionId = chatSessionIdRef.current;
          if (sessionId && phaseRef.current !== 'result') {
            void getTeachGrade(sessionId).then((grade) => finishWithGrade(grade, true)).catch(() => setPhase('failed'));
          } else setPhase('failed');
        },
      });
      socketRef.current = socket;
      socket.open();
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 404 ? 'This teaching topic could not be found.' : 'Could not start the teaching session.');
      setPhase('failed');
    }
  }, [cleanupAudio, finishWithGrade]);

  const send = useCallback((payload: object) => socketRef.current?.send(payload), []);
  const endExplanation = useCallback(() => {
    send({ type: 'input_audio_buffer.commit' });
    send({ type: 'end_explanation' });
    setPhase('qna');
  }, [send]);
  const endTeaching = useCallback(() => { setPhase('grading'); send({ type: 'end_teaching' }); }, [send]);
  const close = useCallback(() => {
    leavingRef.current = true;
    if (phaseRef.current === 'explaining' || phaseRef.current === 'qna') send({ type: 'end_teaching' });
    socketRef.current?.close(1000);
    socketRef.current = null;
    void cleanupAudio();
  }, [cleanupAudio, send]);

  useEffect(() => close, [close]);
  return { phase, messages, result, error, historyNotice, chatSessionId, connect, endExplanation, endTeaching, close };
}
