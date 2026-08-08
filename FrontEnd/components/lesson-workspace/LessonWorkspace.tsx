"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  LayoutGrid,
  Loader2,
  Maximize2,
  Minimize2,
  Mic,
  Pencil,
  Plus,
  Square,
  StickyNote,
  Trash2,
  Minus,
  RotateCcw,
  ZoomIn,
} from "lucide-react";
import EBookContainer from "@/components/ebook/EBookContainer";
import LessonTutor from "@/components/lesson-workspace/LessonTutor";
import type { Lesson, Unit } from "@/types/lessons-types";
import { ApiError, api } from "@/lib/api";
import {
  getLessonStickyNotes,
  resolveContentContext,
  type ContentContext,
} from "@/lib/content-api";
import {
  getSupportedRecordingMimeType,
  transcribeRecordedAudio,
} from "@/lib/stt-api";

interface StickyNoteItem {
  id: string;
  text: string;
  color: string;
  x?: number;
  y?: number;
  rotation?: number;
  remoteId?: string;
  selectedText?: string | null;
  updatedAt?: string;
}

const NOTE_COLORS = ["#FFF4B8", "#DDF7E7", "#DDEBFF", "#FFE1E1"];
const MAX_NOTES_PER_SESSION = 30;
const MAX_NOTE_CHARACTERS = 200;
const NOTE_GRID_COLUMNS = 5;
const NOTE_GRID_X = 230;
const NOTE_GRID_Y = 180;
const NOTE_CANVAS_WIDTH = 1200;
const NOTE_CANVAS_HEIGHT = 1120;
const PAPER_SLAP_SOUND =
  "https://orangefreesounds.com/wp-content/uploads/2015/10/Slap-sound-effect.mp3";

function timestamp() {
  return Date.now();
}

function playPaperFallback() {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(145, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    62,
    context.currentTime + 0.09,
  );
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.11);
  window.setTimeout(() => void context.close(), 180);
}

function getStoredNotes(key: string): StickyNoteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(key);
    return saved
      ? (JSON.parse(saved) as StickyNoteItem[]).map((note) => ({
          ...note,
          text: note.text.slice(0, MAX_NOTE_CHARACTERS),
        })).map(constrainNotePosition)
      : [];
  } catch {
    return [];
  }
}

function getGridPosition(index: number) {
  return {
    x: 30 + (index % NOTE_GRID_COLUMNS) * NOTE_GRID_X,
    y: 34 + Math.floor(index / NOTE_GRID_COLUMNS) * NOTE_GRID_Y,
  };
}

function getNoteDimensions(text: string) {
  const growth = Math.min(4, Math.ceil(text.length / 50));
  return {
    width: 158 + growth * 15,
    height: 116 + growth * 15,
  };
}

function constrainNotePosition(note: StickyNoteItem, index: number): StickyNoteItem {
  const fallback = getGridPosition(index);
  const dimensions = getNoteDimensions(note.text);
  return {
    ...note,
    x: Math.max(0, Math.min(NOTE_CANVAS_WIDTH - dimensions.width, note.x ?? fallback.x)),
    y: Math.max(0, Math.min(NOTE_CANVAS_HEIGHT - dimensions.height, note.y ?? fallback.y)),
  };
}

function NotesBoard({
  lesson,
  contentContext,
  selectedText,
  openComposer,
  onSelectedTextConsumed,
  onComposerClose,
}: {
  lesson: Lesson;
  contentContext: ContentContext | null;
  selectedText?: string | null;
  openComposer?: boolean;
  onSelectedTextConsumed?: () => void;
  onComposerClose?: () => void;
}) {
  const storageKey = `adaptiv-lesson-notes:${lesson.id}`;
  const [notes, setNotes] = useState<StickyNoteItem[]>(() =>
    getStoredNotes(storageKey),
  );
  const [draft, setDraft] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [isOrganized, setIsOrganized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const notesBoardRef = useRef<HTMLElement>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === notesBoardRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!contentContext) return;
    let active = true;
    void getLessonStickyNotes(contentContext.lesson.id)
      .then((remoteNotes) => {
        if (!active) return;
        const nextNotes = remoteNotes
          .slice(0, MAX_NOTES_PER_SESSION)
          .map((remoteNote, index) => constrainNotePosition({
            id: remoteNote.id,
            remoteId: remoteNote.id,
            text: remoteNote.note.slice(0, MAX_NOTE_CHARACTERS),
            selectedText: remoteNote.selected_text,
            updatedAt: remoteNote.updated_at,
            color: NOTE_COLORS[index % NOTE_COLORS.length],
            ...getGridPosition(index),
            rotation: 0,
          }, index));
        setNotes(nextNotes);
        window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [contentContext, storageKey]);

  const saveNotes = (nextNotes: StickyNoteItem[]) => {
    setNotes(nextNotes);
    window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
  };

  const addNote = async () => {
    const text = (draft || selectedText || "")
      .trim()
      .slice(0, MAX_NOTE_CHARACTERS);
    if (!text || notes.length >= MAX_NOTES_PER_SESSION) return;
    const noteIndex = notes.length;
    const optimisticNote = constrainNotePosition({
      id: `${lesson.id}-${Date.now()}`,
      text,
      color: NOTE_COLORS[noteIndex % NOTE_COLORS.length],
      rotation: 0,
      selectedText,
    }, noteIndex);
    saveNotes([...notes, optimisticNote]);
    setIsOrganized(false);
    setDraft("");
    onSelectedTextConsumed?.();
    onComposerClose?.();

    // Freesound paper-smack style effect; browsers may block remote audio, so failure is silent.
    const slap = new Audio(PAPER_SLAP_SOUND);
    slap.volume = 0.34;
    void slap.play().catch(() => playPaperFallback());

    if (contentContext?.classId) {
      try {
        const remoteNote = (await api.post("/api/v1/content/sticky-notes", {
          class_id: contentContext.classId,
          lesson_id: contentContext.lesson.id,
          note: text,
          selected_text: selectedText || undefined,
        })) as { id: string; updated_at?: string };
        setNotes((current) => {
          const nextNotes = current.map((note) =>
            note.id === optimisticNote.id
              ? {
                  ...note,
                  id: remoteNote.id,
                  remoteId: remoteNote.id,
                  updatedAt: remoteNote.updated_at,
                }
              : note,
          );
          window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
          return nextNotes;
        });
      } catch {
        toast.error("Note saved locally, but could not sync to your account.");
      }
    }
  };

  const saveEditedNote = async () => {
    const note = notes.find((item) => item.id === editingNoteId);
    const text = editingDraft.trim().slice(0, MAX_NOTE_CHARACTERS);
    if (!note || !text) return;
    if (note.remoteId) {
      try {
        const updated = (await api.patch(
          `/api/v1/content/sticky-notes/${note.remoteId}`,
          { note: text },
        )) as { updated_at?: string };
        saveNotes(
          notes.map((item) =>
            item.id === note.id
              ? { ...item, text, updatedAt: updated.updated_at }
              : item,
          ),
        );
      } catch {
        toast.error("Could not update this note.");
        return;
      }
    } else {
      saveNotes(
        notes.map((item) => (item.id === note.id ? { ...item, text } : item)),
      );
    }
    setEditingNoteId(null);
  };

  const changeZoom = (amount: number) =>
    setZoom((value) => Math.min(1.55, Math.max(0.35, value + amount)));
  const resetCanvas = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await notesBoardRef.current?.requestFullscreen();
  };

  const organizeNotes = () => {
    saveNotes(
      notes.map((note, index) => constrainNotePosition({
        ...note,
        rotation: 0,
      }, index)),
    );
    setSelectedNoteId(null);
    setIsOrganized(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    toast.success("Notes organized.");
  };

  const deleteAllNotes = () => {
    if (!notes.length) return;
    toast("Delete all sticky notes?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete all",
        onClick: () => {
          void Promise.all(
            notes
              .filter((note) => note.remoteId)
              .map((note) =>
                api.delete(`/api/v1/content/sticky-notes/${note.remoteId}`),
              ),
          ).catch(() =>
            toast.error("Some notes could not be removed from your account."),
          );
          saveNotes([]);
          setSelectedNoteId(null);
          setIsOrganized(false);
          toast.success("All sticky notes deleted.");
        },
      },
      cancel: { label: "Cancel", onClick: () => undefined },
    });
  };

  const getVoiceError = (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.status === 413) return "Recording too large (max 25 MB).";
      if (error.status === 422)
        return "No speech detected. Please try again and speak louder or closer to the mic.";
      if (error.status === 502 || error.status === 503)
        return "Transcription service unavailable. Try again.";
    }
    if (error instanceof DOMException && error.name === "NotAllowedError")
      return "Microphone permission is required.";
    if (error instanceof TypeError)
      return "Could not reach transcription server.";
    return error instanceof Error
      ? error.message
      : "Could not reach transcription server.";
  };

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const toggleVoiceInput = async () => {
    if (isListening) {
      await stopVoiceInput();
      return;
    }
    if (isTranscribing) return;

    try {
      setVoiceStatus("");
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error("Voice input is not supported in this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const mimeType = getSupportedRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      recordedChunksRef.current = [];
      stopRequestedRef.current = false;
      mediaStreamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stopMediaStream();
        recorderRef.current = null;
        setIsListening(false);
        setIsTranscribing(true);
        setVoiceStatus("Transcribing…");
        try {
          const blob = new Blob(recordedChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          console.log(
            "🎤 Recorded blob:",
            blob.size,
            "bytes,",
            recordedChunksRef.current.length,
            "chunks",
          );
          console.log("blob size:", blob.size);
          if (blob.size > 25 * 1024 * 1024)
            throw new Error("Recording too large (max 25 MB).");
          if (!blob.size)
            throw new Error(
              "No audio was recorded. Please try again and speak clearly.",
            );
          const extension = (recorder.mimeType || "audio/webm").includes("mp4")
            ? "m4a"
            : "webm";
          const file = new File([blob], `voice.${extension}`, {
            type: blob.type,
          });
          const result = await transcribeRecordedAudio(file, undefined, "en");
          const transcript = result.text?.trim() ?? "";
          if (!transcript)
            throw new ApiError(422, { detail: "Audio was empty or invalid." });
          setDraft((current) =>
            `${current}${current ? " " : ""}${transcript}`
              .trim()
              .slice(0, MAX_NOTE_CHARACTERS),
          );
          setVoiceStatus("Voice note captured. You can edit it before adding.");
        } catch (error) {
          setVoiceStatus(getVoiceError(error));
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.start(250);
      recordingStartedAtRef.current = timestamp();
      setIsListening(true);
      setVoiceStatus("Recording… click the mic to stop.");
    } catch (error) {
      stopMediaStream();
      setIsListening(false);
      setVoiceStatus(getVoiceError(error));
    }
  };

  const stopVoiceInput = async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording" || stopRequestedRef.current)
      return;
    stopRequestedRef.current = true;
    console.log("recorder state before stop:", recorder.state);
    console.log("chunks count:", recordedChunksRef.current.length);
    const elapsed = timestamp() - recordingStartedAtRef.current;
    if (elapsed < 500)
      await new Promise((resolve) => window.setTimeout(resolve, 500 - elapsed));
    if (recorder.state === "recording") recorder.stop();
  };

  useEffect(
    () => () => {
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        if (recorderRef.current.state !== "inactive")
          recorderRef.current.stop();
      }
      stopRequestedRef.current = true;
      stopMediaStream();
    },
    [],
  );

  return (
    <section
      ref={notesBoardRef}
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-200 bg-white shadow-sm ${isFullscreen ? "h-[100dvh] w-screen rounded-none" : "rounded-2xl"}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <StickyNote size={17} className="text-brand-primary" />
          <h2 className="text-sm font-extrabold text-slate-800">My notes</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={organizeNotes}
            disabled={notes.length < 2}
            className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isOrganized ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-brand-primary-tint bg-brand-primary-bg text-brand-primary hover:bg-brand-primary-tint"}`}
            aria-label={
              isOrganized ? "Notes are organized" : "Organize notes into a grid"
            }
            title={isOrganized ? "Notes are organized" : "Organize notes"}
            aria-pressed={isOrganized}
          >
            {isOrganized ? <Check size={14} /> : <LayoutGrid size={14} />}
          </button>
          <button
            type="button"
            onClick={deleteAllNotes}
            disabled={!notes.length}
            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Delete all sticky notes"
            title="Delete all notes"
          >
            <Trash2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={
              isFullscreen
                ? "Exit fullscreen notes"
                : "Open notes in fullscreen"
            }
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <span className="hidden text-[11px] font-semibold text-slate-400 sm:inline">
            Saved automatically
          </span>
        </div>
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-hidden bg-[#e8edf2] p-3"
        onWheel={(event) => {
          event.preventDefault();
          changeZoom(event.deltaY > 0 ? -0.08 : 0.08);
        }}
      >
        <div className="pointer-events-none absolute left-5 top-4 z-20 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm backdrop-blur-sm">
          Drag canvas · scroll to zoom
        </div>
        <div className="absolute right-4 top-3 z-20 flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => changeZoom(-0.1)}
            aria-label="Zoom out"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-[10px] font-bold text-slate-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => changeZoom(0.1)}
            aria-label="Zoom in"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={resetCanvas}
            aria-label="Reset canvas view"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <RotateCcw size={13} />
          </button>
        </div>
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={() => {
            dragOrigin.current = pan;
          }}
          onDrag={(_, info) =>
            setPan({
              x: dragOrigin.current.x + info.offset.x,
              y: dragOrigin.current.y + info.offset.y,
            })
          }
          className="absolute left-1/2 top-1/2 h-[1120px] w-[1200px] cursor-grab touch-none active:cursor-grabbing"
          style={{
            x: pan.x,
            y: pan.y,
            scale: zoom,
            marginLeft: -600,
            marginTop: -560,
          }}
        >
          <div className="absolute inset-0 rounded-xl border border-slate-300/70 bg-[#dfe5e9] shadow-inner" />
          <AnimatePresence initial={false}>
            {notes.map((note, index) => (
              <motion.article
                key={note.id}
                layout
                drag
                dragMomentum={false}
                dragElastic={0.05}
                dragConstraints={{
                  left: 0,
                  right: Math.max(0, NOTE_CANVAS_WIDTH - getNoteDimensions(note.text).width),
                  top: 0,
                  bottom: Math.max(0, NOTE_CANVAS_HEIGHT - getNoteDimensions(note.text).height),
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setSelectedNoteId(note.id);
                }}
                onDragStart={() => setSelectedNoteId(note.id)}
                onDragEnd={(_, info) => {
                  const boundedNote = constrainNotePosition(note, index);
                  const dimensions = getNoteDimensions(note.text);
                  saveNotes(
                    notes.map((item) =>
                      item.id === note.id
                        ? {
                            ...item,
                            x: Math.max(
                              0,
                              Math.min(
                                NOTE_CANVAS_WIDTH - dimensions.width,
                                boundedNote.x! + info.offset.x / zoom,
                              ),
                            ),
                            y: Math.max(
                              0,
                              Math.min(
                                NOTE_CANVAS_HEIGHT - dimensions.height,
                                boundedNote.y! + info.offset.y / zoom,
                              ),
                            ),
                          }
                        : item,
                    ),
                  );
                  setIsOrganized(false);
                }}
                initial={{
                  opacity: 0,
                  scale: 1.25,
                  y: -34,
                  rotate: (note.rotation ?? 0) - 7,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotate: note.rotation ?? 0,
                }}
                exit={{ opacity: 0, scale: 0.82, y: -12, rotate: -7 }}
                transition={{
                  type: "spring",
                  stiffness: 440,
                  damping: 22,
                  mass: 0.7,
                }}
                className={`absolute min-h-[116px] min-w-[158px] cursor-grab overflow-hidden p-3.5 text-slate-700 [clip-path:polygon(0_0,100%_0,100%_86%,86%_100%,0_100%)] [filter:drop-shadow(0_7px_5px_rgba(15,23,42,0.18))] active:cursor-grabbing ${selectedNoteId === note.id ? "z-10 ring-2 ring-brand-primary ring-offset-2" : ""}`}
                style={{
                  ...getNoteDimensions(note.text),
                  left: constrainNotePosition(note, index).x,
                  top: constrainNotePosition(note, index).y,
                  backgroundColor: note.color,
                  backgroundImage:
                    "linear-gradient(115deg, rgba(255,255,255,.42), transparent 42%), repeating-linear-gradient(0deg, rgba(120,90,40,.045) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,255,255,.14) 0 1px, transparent 1px 5px)",
                }}
              >
                <p className="pointer-events-none break-words pr-5 text-xs font-bold leading-5">
                  {note.text}
                </p>
                {note.selectedText && (
                  <p className="pointer-events-none mt-2 line-clamp-2 border-t border-slate-500/10 pt-2 text-[10px] font-medium italic leading-4 text-slate-500">
                    “{note.selectedText}”
                  </p>
                )}
                {note.updatedAt && (
                  <p className="pointer-events-none mt-1 text-[9px] font-semibold text-slate-500/70">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                )}
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    if (note.remoteId)
                      void api
                        .delete(`/api/v1/content/sticky-notes/${note.remoteId}`)
                        .catch(() =>
                          toast.error(
                            "Could not remove this note from your account.",
                          ),
                        );
                    saveNotes(notes.filter((item) => item.id !== note.id));
                  }}
                  aria-label="Delete note"
                  className="absolute right-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-md text-slate-500/70 transition-colors hover:bg-white/35 hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    setEditingNoteId(note.id);
                    setEditingDraft(note.text);
                  }}
                  aria-label="Edit note"
                  className="absolute right-9 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-md text-slate-500/70 transition-colors hover:bg-white/35 hover:text-brand-primary"
                >
                  <Pencil size={12} />
                </button>
              </motion.article>
            ))}
          </AnimatePresence>
          {notes.length === 0 && (
            <div className="absolute inset-0 grid place-items-center text-center">
              <div className="rounded-2xl bg-white/65 px-6 py-5 shadow-sm backdrop-blur-sm">
                <StickyNote
                  size={24}
                  className="mx-auto text-brand-primary/60"
                />
                <p className="mt-2 text-xs font-extrabold text-slate-600">
                  Your canvas is ready
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Add a note and slap it onto the board.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      {editingNoteId && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-900/20 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800">
                Edit sticky note
              </h3>
              <button
                type="button"
                onClick={() => setEditingNoteId(null)}
                aria-label="Close editor"
                className="text-lg text-slate-400"
              >
                ×
              </button>
            </div>
            <textarea
              autoFocus
              maxLength={MAX_NOTE_CHARACTERS}
              value={editingDraft}
              onChange={(event) => setEditingDraft(event.target.value)}
              className="mt-3 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none focus:border-brand-primary"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNoteId(null)}
                className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEditedNote()}
                className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-white hover:bg-brand-primary-dark"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
      {openComposer && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-900/20 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800">
                Add sticky note
              </h3>
              <button
                type="button"
                onClick={() => {
                  onComposerClose?.();
                  onSelectedTextConsumed?.();
                }}
                aria-label="Close note editor"
                className="text-lg text-slate-400"
              >
                ×
              </button>
            </div>
            {selectedText && (
              <p className="mt-3 rounded-xl border border-brand-primary-tint bg-brand-primary-bg p-3 text-[11px] italic leading-5 text-brand-primary">
                “{selectedText}”
              </p>
            )}
            <textarea
              autoFocus
              maxLength={MAX_NOTE_CHARACTERS}
              value={draft || selectedText?.slice(0, MAX_NOTE_CHARACTERS) || ""}
              onChange={(event) =>
                setDraft(event.target.value.slice(0, MAX_NOTE_CHARACTERS))
              }
              placeholder="Write your note…"
              className="mt-3 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none focus:border-brand-primary"
            />
            <div className="mt-1 text-right text-[10px] text-slate-400">
              {(draft || selectedText || "").length}/{MAX_NOTE_CHARACTERS}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onComposerClose?.();
                  onSelectedTextConsumed?.();
                }}
                className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void addNote()}
                className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-white hover:bg-brand-primary-dark"
              >
                Add note
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="shrink-0 border-t border-slate-100 p-3">
        {notes.length >= MAX_NOTES_PER_SESSION && (
          <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
            You’ve reached the {MAX_NOTES_PER_SESSION}-note limit for this
            lesson session.
          </p>
        )}
        {voiceStatus && (
          <p
            className={`mb-2 text-[10px] font-semibold ${isListening || isTranscribing ? "text-brand-primary" : "text-slate-400"}`}
            role="status"
          >
            {voiceStatus}
          </p>
        )}
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              disabled={notes.length >= MAX_NOTES_PER_SESSION}
              maxLength={MAX_NOTE_CHARACTERS}
              value={draft || selectedText?.slice(0, MAX_NOTE_CHARACTERS) || ""}
              onChange={(event) =>
                setDraft(event.target.value.slice(0, MAX_NOTE_CHARACTERS))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") void addNote();
              }}
              placeholder={
                notes.length >= MAX_NOTES_PER_SESSION
                  ? "Session note limit reached"
                  : "Write a sticky note..."
              }
              aria-label="New sticky note"
              className="h-full w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-14 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
              {draft.length}/{MAX_NOTE_CHARACTERS}
            </span>
          </div>
          <button
            disabled={notes.length >= MAX_NOTES_PER_SESSION || isTranscribing}
            type="button"
            onClick={() => void toggleVoiceInput()}
            aria-label={
              isTranscribing
                ? "Transcribing voice note"
                : isListening
                  ? "Stop recording"
                  : "Record a voice note"
            }
            aria-pressed={isListening}
            title={
              isTranscribing
                ? "Transcribing…"
                : isListening
                  ? "Stop recording"
                  : "Record a voice note"
            }
            className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${isListening ? "animate-pulse bg-red-500 text-white hover:bg-red-600" : isTranscribing ? "cursor-not-allowed bg-orange-100 text-orange-600" : "bg-brand-primary-bg text-brand-primary hover:bg-brand-primary-tint"}`}
          >
            {isTranscribing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isListening ? (
              <Square size={15} fill="currentColor" />
            ) : (
              <Mic size={16} />
            )}
          </button>
          <button
            disabled={notes.length >= MAX_NOTES_PER_SESSION}
            type="button"
            onClick={() => void addNote()}
            aria-label="Add note"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-primary text-white transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function LessonWorkspace({
  unit,
  lesson,
}: {
  unit: Unit;
  lesson: Lesson;
}) {
  const [completed, setCompleted] = useState(false);
  const [contentContext, setContentContext] = useState<ContentContext | null>(
    null,
  );
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [noteSelection, setNoteSelection] = useState<string | null>(null);
  const [noteComposerOpen, setNoteComposerOpen] = useState(false);
  const [isLessonFullScreen, setIsLessonFullScreen] = useState(false);
  const [selectionPoint, setSelectionPoint] = useState({ x: 0, y: 0 });
  const unitIndex = unit.lessons.findIndex((item) => item.id === lesson.id);

  useEffect(() => {
    if (!isLessonFullScreen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLessonFullScreen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isLessonFullScreen]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";
      const anchor = selection?.anchorNode;
      const lessonContent =
        anchor instanceof Node
          ? (anchor.parentElement?.closest("[data-lesson-content]") ?? null)
          : null;
      if (!text || !lessonContent) return;
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();
      if (!rect) return;
      setSelectedText(text.slice(0, 1200));
      setSelectionPoint({
        x: Math.min(window.innerWidth - 250, Math.max(16, rect.left)),
        y: Math.max(70, rect.top - 48),
      });
    };
    document.addEventListener("selectionchange", handleSelection);
    return () =>
      document.removeEventListener("selectionchange", handleSelection);
  }, []);

  useEffect(() => {
    let active = true;
    void resolveContentContext(lesson.id, lesson.title, unit.courseTitle)
      .then((context) => {
        if (active) setContentContext(context);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [lesson.id, lesson.title, unit.courseTitle]);

  useEffect(() => {
    if (!contentContext) return;
    void api
      .get(`/api/v1/content/lessons/${contentContext.lesson.id}/progress`)
      .then((progress) => {
        setCompleted(Boolean((progress as { completed?: boolean }).completed));
      })
      .catch(() => undefined);
  }, [contentContext]);

  const toggleCompleted = async () => {
    const nextCompleted = !completed;
    setCompleted(nextCompleted);
    if (!contentContext) return;
    try {
      await api.put(
        `/api/v1/content/lessons/${contentContext.lesson.id}/progress`,
        { completed: nextCompleted },
      );
      toast.success(
        nextCompleted ? "Lesson marked complete." : "Lesson marked incomplete.",
      );
    } catch {
      setCompleted(!nextCompleted);
      toast.error("Progress could not be saved.");
    }
  };

  return (
    <main
      className={`flex h-[100dvh] min-h-[640px] flex-col overflow-hidden bg-slate-50 ${isLessonFullScreen ? "relative" : ""}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link
          href={`/learn/computer-science/${unit.id}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft size={18} />{" "}
          <span className="hidden sm:inline">Back to {unit.courseTitle}</span>
        </Link>
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-extrabold text-slate-800">
            {lesson.title}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">
            Lesson {unitIndex + 1} · {unit.title}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void toggleCompleted()}
          className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition-colors ${completed ? "bg-emerald-100 text-emerald-700" : "bg-brand-primary text-white hover:bg-brand-primary-dark"}`}
        >
          {completed ? <Check size={15} /> : null}
          {completed ? "Completed" : "Mark complete"}
        </button>
      </header>
      <div
        className={`relative grid min-h-0 flex-1 grid-cols-1 transition-all duration-300 ${isLessonFullScreen ? "gap-0 p-0" : "gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)] lg:p-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.7fr)]"}`}
      >
        {selectedText && (
          <div
            className="fixed z-50 flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
            style={{ left: selectionPoint.x, top: selectionPoint.y }}
          >
            <button
              type="button"
              onClick={() => {
                setNoteSelection(selectedText);
                setNoteComposerOpen(true);
                setSelectedText(null);
                window.getSelection()?.removeAllRanges();
              }}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-brand-primary hover:bg-brand-primary-bg"
            >
              Add note
            </button>
            <button
              type="button"
              onClick={() => window.getSelection()?.removeAllRanges()}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 hover:bg-slate-100"
            >
              Explain highlighted text
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedText(null);
                window.getSelection()?.removeAllRanges();
              }}
              aria-label="Cancel text selection"
              className="rounded-lg px-2 py-1.5 text-slate-400 hover:bg-slate-100"
            >
              ×
            </button>
          </div>
        )}
        <section
          className={`relative min-h-0 overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 ${isLessonFullScreen ? "fixed inset-0 z-[100] h-[100dvh] w-screen rounded-none" : "rounded-2xl"}`}
        >
          <button
            type="button"
            onClick={() => setIsLessonFullScreen((value) => !value)}
            aria-label={
              isLessonFullScreen
                ? "Exit full screen"
                : "Open lesson in full screen"
            }
            aria-pressed={isLessonFullScreen}
            title={isLessonFullScreen ? "Exit full screen" : "Full screen"}
            className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors duration-200 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {isLessonFullScreen ? (
              <Minimize2 size={17} />
            ) : (
              <Maximize2 size={17} />
            )}
          </button>
          <EBookContainer
            lessonId={contentContext?.lesson.id ?? lesson.id}
            contentLesson={contentContext?.lesson}
            topic={lesson.title}
            bookTitle={unit.courseTitle}
            embedded
          />
        </section>
        {!isLessonFullScreen && (
          <div className="grid min-h-0 grid-rows-2 gap-3 sm:gap-4">
            <NotesBoard
              lesson={lesson}
              contentContext={contentContext}
              selectedText={noteSelection}
              openComposer={noteComposerOpen}
              onSelectedTextConsumed={() => setNoteSelection(null)}
              onComposerClose={() => setNoteComposerOpen(false)}
            />
            <LessonTutor
              lessonId={contentContext?.lesson.id ?? lesson.id}
              lessonTitle={lesson.title}
              selectedText={selectedText}
              onClearSelectedText={() => setSelectedText(null)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
