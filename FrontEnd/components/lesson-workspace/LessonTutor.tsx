'use client';

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Mic, Radio, RefreshCw, Send, Sparkles, Square } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { createChatSession, getChatSession, listChatSessions, sendChatMessage, type ChatMessage } from '@/lib/chat-api';
import { getSupportedRecordingMimeType, realtimeSocketUrl, transcribeRecordedAudio } from '@/lib/stt-api';
import LessonVisualRenderer from '@/components/lesson/lesson-visual-renderer';

function timestamp() {
  return Date.now();
}

interface Props {
  lessonId: string;
  lessonTitle: string;
  selectedText?: string | null;
  onClearSelectedText?: () => void;
}

type VoiceMode = 'recorded' | 'realtime';

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

function resample(samples: Float32Array, inputRate: number, targetRate: number) {
  if (inputRate === targetRate) return samples;
  const outputLength = Math.max(1, Math.round(samples.length * targetRate / inputRate));
  const output = new Float32Array(outputLength);
  const ratio = inputRate / targetRate;
  for (let index = 0; index < outputLength; index += 1) {
    const sourcePosition = index * ratio;
    const lower = Math.floor(sourcePosition);
    const upper = Math.min(lower + 1, samples.length - 1);
    const weight = sourcePosition - lower;
    output[index] = samples[lower] * (1 - weight) + samples[upper] * weight;
  }
  return output;
}

function pcm16Base64(samples: Float32Array) {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]));
    const value = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(index * 2, value, true);
  }
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return window.btoa(binary);
}

export default function LessonTutor({ lessonId, lessonTitle, selectedText, onClearSelectedText }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('recorded');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voicePreview, setVoicePreview] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestedLessonRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef(0);
  const stopRecordedRequestedRef = useRef(false);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessages([]);
    setSessionId(null);
    try {
      const sessions = await listChatSessions();
      const existing = sessions.find((session) => session.lesson_id === lessonId);
      const session = existing ?? await createChatSession(lessonId);
      setSessionId(session.id);
      const detail = await getChatSession(session.id);
      setMessages(detail.messages ?? []);
    } catch (loadError) {
      setError(getChatError(loadError));
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (requestedLessonRef.current === lessonId) return;
    requestedLessonRef.current = lessonId;
    const requestId = window.setTimeout(() => void loadSession(), 0);
    return () => window.clearTimeout(requestId);
  }, [lessonId, loadSession]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, sending]);

  const stopAudioResources = () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    processorRef.current = null;
    sourceRef.current = null;
    mediaStreamRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') void audioContextRef.current.close();
    audioContextRef.current = null;
  };

  const finishRealtime = () => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
    stopAudioResources();
    setRecording(false);
    setTranscribing(false);
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

  const startRealtime = async () => {
    try {
      setVoiceError(null);
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext || !window.WebSocket) throw new Error('Voice input is not supported in this browser.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const context = new AudioContext();
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const socket = new WebSocket(realtimeSocketUrl());
      mediaStreamRef.current = stream;
      audioContextRef.current = context;
      sourceRef.current = source;
      processorRef.current = processor;
      socketRef.current = socket;
      setVoicePreview('');
      socket.onopen = () => {
        source.connect(processor);
        processor.connect(context.destination);
        setRecording(true);
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as { type?: string; delta?: string; transcript?: string; message?: string };
          if (data.type === 'conversation.item.input_audio_transcription.delta') setVoicePreview((current) => current + (data.delta ?? ''));
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            const transcript = data.transcript?.trim() ?? '';
            if (transcript) setDraft((current) => current ? `${current} ${transcript}`.trim() : transcript);
            setVoicePreview('');
          }
          if (data.type === 'error') {
            const message = data.message || 'Realtime transcription failed.';
            setVoiceError(message);
            toast.error(message);
            finishRealtime();
          }
        } catch {
          setVoiceError('Could not read the realtime transcription response.');
          finishRealtime();
        }
      };
      socket.onerror = () => {
        setVoiceError('Could not reach transcription server.');
        finishRealtime();
      };
      socket.onclose = () => {
        stopAudioResources();
        setRecording(false);
        setTranscribing(false);
      };
      processor.onaudioprocess = (event) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        const mono = event.inputBuffer.getChannelData(0);
        const samples = resample(mono, context.sampleRate, 24000);
        socket.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: pcm16Base64(samples) }));
      };
    } catch (permissionError) {
      stopAudioResources();
      const message = getSpeechError(permissionError);
      setVoiceError(message);
      toast.error(message);
    }
  };

  const stopRealtime = () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      finishRealtime();
      return;
    }
    socket.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    setRecording(false);
    setTranscribing(true);
    stopAudioResources();
    stopTimerRef.current = window.setTimeout(finishRealtime, 4000);
  };

  const toggleVoice = () => {
    if (voiceMode === 'realtime') {
      if (recording) stopRealtime();
      else if (!transcribing) void startRealtime();
    } else if (recording) stopRecorded();
    else if (!transcribing) void startRecorded();
  };

  useEffect(() => () => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      recorderRef.current = null;
    }
    stopRecordedRequestedRef.current = true;
    socketRef.current?.close();
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
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-primary-bg text-brand-primary"><Bot size={16} /></span>
        <div className="min-w-0"><h2 className="text-sm font-extrabold text-slate-800">Ask about this lesson</h2><p className="truncate text-[10px] font-semibold text-emerald-600">{lessonTitle}</p></div>
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
          <button type="button" onClick={() => setVoiceMode((mode) => mode === 'recorded' ? 'realtime' : 'recorded')} disabled={recording || transcribing} aria-label={`Use ${voiceMode === 'recorded' ? 'realtime' : 'recorded'} voice transcription`} className="hidden h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-2 text-[10px] font-bold text-slate-500 transition-colors hover:border-brand-primary hover:text-brand-primary sm:flex"><Radio size={13} />{voiceMode === 'recorded' ? 'Live' : 'Record'}</button>
          <button type="button" onClick={toggleVoice} disabled={sending || transcribing} aria-label={transcribing ? 'Transcribing voice' : recording ? 'Stop recording' : `Start ${voiceMode} voice input`} title={transcribing ? 'Transcribing…' : recording ? 'Stop recording' : `Start ${voiceMode} voice input`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${recording ? 'animate-pulse bg-red-500 text-white hover:bg-red-600' : transcribing ? 'cursor-not-allowed bg-orange-100 text-orange-600' : 'bg-brand-primary-bg text-brand-primary hover:bg-brand-primary-tint'}`}>{transcribing ? <Loader2 size={16} className="animate-spin" /> : recording ? <Square size={15} fill="currentColor" /> : <Mic size={16} />}</button>
          <button type="submit" disabled={!draft.trim() || loading || sending || !sessionId} aria-label="Send question" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-brand-primary disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /></button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">{recording ? `Recording ${voiceMode} voice… press the microphone to stop.` : transcribing ? 'Transcribing your voice…' : `Enter to send · Shift + Enter for a new line · ${voiceMode === 'recorded' ? 'Recorded' : 'Realtime'} voice`}</p>
      </form>
    </section>
  );
}
