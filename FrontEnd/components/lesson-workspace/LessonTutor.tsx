'use client';

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Maximize2, Minimize2, Mic, RefreshCw, Send, Sparkles, Square } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { createChatSession, getChatSession, listChatSessions, sendChatMessage, type ChatMessage } from '@/lib/chat-api';
import { getSupportedRecordingMimeType, transcribeRecordedAudio } from '@/lib/stt-api';
import LessonVisualRenderer from '@/components/lesson/lesson-visual-renderer';
import { useUser } from '@/context/UserContext';

function timestamp() {
  return Date.now();
}

interface Props {
  lessonId: string;
  lessonTitle: string;
  selectedText?: string | null;
  onClearSelectedText?: () => void;
}

function getChatError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Please sign in again to use the lesson tutor.';
    if (error.status === 404) return 'This lesson tutor session could not be found.';
    if (error.status === 422) return 'Please enter a question before sending.';
    if (error.status === 502) return 'The tutor is temporarily unavailable. Please try again.';
  }
  return 'The tutor could not connect. Check your connection and try again.';
}

function getSpeechError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Please sign in again to use voice input.';
    if (error.status === 413) return 'Recording too large (max 25 MB).';
    if (error.status === 422) return 'No speech detected. Please try again and speak louder or closer to the mic.';
    if (error.status === 502 || error.status === 503) return 'Transcription service unavailable. Try again.';
  }
  if (error instanceof DOMException && error.name === 'NotAllowedError') return 'Microphone permission is required.';
  if (error instanceof TypeError) return 'Could not reach transcription server.';
  return error instanceof Error ? error.message : 'Could not reach transcription server.';
}

export default function LessonTutor({ lessonId, lessonTitle, selectedText, onClearSelectedText }: Props) {
  const { authUser } = useUser();
  const debugChat = process.env.NEXT_PUBLIC_DEBUG_CHAT === 'true';
  const debugLog = useCallback((...args: unknown[]) => {
    if (debugChat) console.log(...args);
  }, [debugChat]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voicePreview, setVoicePreview] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestedLessonRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const stopRecordedRequestedRef = useRef(false);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    if (!fullScreen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setFullScreen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [fullScreen]);

  const loadSession = useCallback(async () => {
    debugLog('🟢 About to load session, guards:', { hasLessonId: !!lessonId, hasUser: !!authUser });
    setLoading(true);
    setError(null);
    setMessages([]);
    setSessionId(null);
    try {
      debugLog('🟢 Calling listChatSessions()');
      const sessions = await listChatSessions();
      debugLog('🟢 Session list received:', sessions.length);
      const existing = sessions.find((session) => session.lesson_id === lessonId);
      const session = existing ?? await createChatSession(lessonId);
      debugLog('🟢 Session selected:', session.id);
      setSessionId(session.id);
      const detail = await getChatSession(session.id);
      setMessages(detail.messages ?? []);
    } catch (loadError) {
      debugLog('🔴 Session load failed:', loadError);
      setError(getChatError(loadError));
    } finally {
      setLoading(false);
    }
  }, [authUser, debugLog, lessonId]);

  useEffect(() => {
    debugLog('🟢 Chat component mounted');
    debugLog('🟢 lessonId:', lessonId);
    debugLog('🟢 user:', authUser);
    return () => debugLog('🟡 Chat component unmounted');
  }, [authUser, debugLog, lessonId]);

  useEffect(() => {
    debugLog('🟡 Session effect running, deps:', { lessonId, user: authUser });
    if (!lessonId) {
      debugLog('🔴 Bailing: no lessonId');
      const requestId = window.setTimeout(() => {
        setLoading(false);
        setError('This lesson could not be identified.');
      }, 0);
      return () => window.clearTimeout(requestId);
    }
    if (requestedLessonRef.current === lessonId) return;
    const requestId = window.setTimeout(() => {
      if (requestedLessonRef.current === lessonId) return;
      requestedLessonRef.current = lessonId;
      debugLog('🟢 Session timer fired; loadSession() will execute');
      void loadSession();
    }, 0);
    return () => window.clearTimeout(requestId);
  }, [authUser, debugLog, lessonId, loadSession]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, sending]);

  const stopAudioResources = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const startRecorded = async () => {
    try {
      setVoiceError(null);
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Voice input is not supported in this browser.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const mimeType = getSupportedRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recordedChunksRef.current = [];
      stopRecordedRequestedRef.current = false;
      mediaStreamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stopAudioResources();
        setRecording(false);
        setTranscribing(true);
        try {
          const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          console.log('🎤 Recorded blob:', blob.size, 'bytes,', recordedChunksRef.current.length, 'chunks');
          console.log('blob size:', blob.size);
          if (blob.size > 25 * 1024 * 1024) throw new Error('Recording too large (max 25 MB).');
          if (!blob.size) throw new Error('No audio was recorded. Please try again and speak clearly.');
          const extension = (recorder.mimeType || 'audio/webm').includes('mp4') ? 'm4a' : 'webm';
          const file = new File([blob], `voice-message.${extension}`, { type: blob.type });
          const result = await transcribeRecordedAudio(file, 'The speaker is asking about a school lesson.', 'en');
          setDraft((current) => current ? `${current} ${result.text ?? ''}`.trim() : (result.text ?? ''));
          setVoicePreview(result.text ?? '');
        } catch (transcriptionError) {
          const message = getSpeechError(transcriptionError);
          setVoiceError(message);
          toast.error(message);
        } finally {
          setTranscribing(false);
        }
      };
      recorder.start(250);
      recordingStartedAtRef.current = timestamp();
      setRecording(true);
    } catch (permissionError) {
      stopAudioResources();
      const message = getSpeechError(permissionError);
      setVoiceError(message);
      toast.error(message);
    }
  };

  const stopRecorded = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording' || stopRecordedRequestedRef.current) return;
    stopRecordedRequestedRef.current = true;
    console.log('recorder state before stop:', recorder.state);
    console.log('chunks count:', recordedChunksRef.current.length);
    const elapsed = timestamp() - recordingStartedAtRef.current;
    void (async () => {
      if (elapsed < 500) await new Promise((resolve) => window.setTimeout(resolve, 500 - elapsed));
      if (recorder.state === 'recording') recorder.stop();
    })();
  };

  const toggleVoice = () => {
    if (recording) stopRecorded();
    else if (!transcribing) void startRecorded();
  };

  useEffect(() => () => {
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      recorderRef.current = null;
    }
    stopRecordedRequestedRef.current = true;
    stopAudioResources();
  }, []);

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || !sessionId || sending) return;
    setSending(true);
    setError(null);
    const optimisticId = `pending-${Date.now()}`;
    setMessages((current) => [...current, { id: optimisticId, role: 'user', content: text, created_at: new Date().toISOString() }]);
    setDraft('');
    try {
      const turn = await sendChatMessage(sessionId, text, selectedText);
      setMessages((current) => [...current.filter((message) => message.id !== optimisticId || message.content !== text), turn.user_message, turn.assistant_message]);
      onClearSelectedText?.();
    } catch (sendError) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setDraft(text);
      const message = getChatError(sendError);
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <section className={`${fullScreen ? 'fixed inset-3 z-50 h-[calc(100dvh-1.5rem)] shadow-2xl' : 'relative'} flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}>
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-primary-bg text-brand-primary"><Bot size={16} /></span>
        <div className="min-w-0 flex-1"><h2 className="text-sm font-extrabold text-slate-800">Ask about this lesson</h2><p className="truncate text-[10px] font-semibold text-emerald-600">{lessonTitle}</p></div>
        <button type="button" onClick={() => setFullScreen((value) => !value)} aria-label={fullScreen ? 'Exit full screen chat' : 'Open chat in full screen'} aria-pressed={fullScreen} title={fullScreen ? 'Exit full screen' : 'Full screen'} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:bg-brand-primary-bg hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
          {fullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hidden">
        {loading && <div className="flex items-center justify-center gap-2 py-8 text-xs font-semibold text-slate-400"><Loader2 size={16} className="animate-spin" /> Loading your tutor session…</div>}
        {!loading && !messages.length && !error && <div className="rounded-2xl bg-slate-50 p-4 text-center text-xs leading-5 text-slate-500"><Sparkles size={18} className="mx-auto mb-2 text-brand-primary" />Ask for an explanation, a hint, or help understanding the lesson.</div>}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-5 ${message.role === 'user' ? 'rounded-br-md bg-brand-primary text-white' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}>
              {message.role === 'assistant' ? <LessonVisualRenderer markdown={message.content} visuals={message.visuals ?? []} /> : message.content}
            </div>
          </div>
        ))}
        {sending && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-slate-400"><Loader2 size={14} className="animate-spin" /></div></div>}
      </div>

      {error && <div className="flex shrink-0 items-center justify-between gap-2 border-t border-red-100 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700"><span>{error}</span><button type="button" onClick={() => void loadSession()} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 hover:bg-red-100"><RefreshCw size={12} /> Retry</button></div>}
      <form onSubmit={(event) => void sendMessage(event)} className="shrink-0 border-t border-slate-100 p-3">
        {selectedText && <div className="mb-2 flex items-start justify-between gap-2 rounded-xl border border-brand-primary-tint bg-brand-primary-bg px-3 py-2 text-[11px] text-brand-primary"><span className="line-clamp-2"><strong>Highlighted:</strong> {selectedText}</span><button type="button" onClick={onClearSelectedText} aria-label="Clear highlighted text">×</button></div>}
        {voiceError && <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700"><span>{voiceError}</span><button type="button" onClick={() => setVoiceError(null)} aria-label="Dismiss voice error">×</button></div>}
        {voicePreview && <div className="mb-2 rounded-xl border border-brand-primary-tint bg-brand-primary-bg px-3 py-2 text-[11px] italic leading-5 text-brand-primary"><span className="mr-1 not-italic font-bold">Listening:</span>{voicePreview}</div>}
        <div className="flex gap-2">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} disabled={loading || sending || transcribing || !sessionId} rows={1} placeholder={selectedText ? 'Ask the tutor to explain this…' : 'Ask about this lesson…'} aria-label="Ask the lesson tutor" className="min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-brand-primary disabled:opacity-60" />
          <button type="button" onClick={toggleVoice} disabled={sending || transcribing} aria-label={transcribing ? 'Transcribing voice' : recording ? 'Stop recording' : 'Start recorded voice input'} title={transcribing ? 'Transcribing…' : recording ? 'Stop recording' : 'Start recorded voice input'} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${recording ? 'animate-pulse bg-red-500 text-white hover:bg-red-600' : transcribing ? 'cursor-not-allowed bg-orange-100 text-orange-600' : 'bg-brand-primary-bg text-brand-primary hover:bg-brand-primary-tint'}`}>{transcribing ? <Loader2 size={16} className="animate-spin" /> : recording ? <Square size={15} fill="currentColor" /> : <Mic size={16} />}</button>
          <button type="submit" disabled={!draft.trim() || loading || sending || !sessionId} aria-label="Send question" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-brand-primary disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /></button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">{recording ? 'Recording voice… press the microphone to stop.' : transcribing ? 'Transcribing your voice…' : 'Enter to send · Shift + Enter for a new line · Recorded voice'}</p>
      </form>
    </section>
  );
}
