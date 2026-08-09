"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  getDuelResult,
  getDuelRoom,
  getDuelWsTicket,
  leaveDuelRoom,
  runDuelTests,
  setDuelReady,
  submitDuelCode,
  duelErrorCode,
  storeDuelRoomCode,
} from "@/lib/duel/api";
import { DuelSocket } from "@/lib/duel/socket";
import type {
  DuelConnectionState,
  DuelEvent,
  DuelGameResult,
  DuelPlayer,
  DuelRoom,
  DuelSubmissionResult,
  DuelOpponentState,
} from "@/lib/duel/types";
import { secondsRemaining } from "@/lib/duel/types";
import { useUser } from "@/context/UserContext";

function payloadOf(event: DuelEvent) {
  return (event.payload ?? {}) as Record<string, unknown>;
}

function roomFromPayload(payload: Record<string, unknown>) {
  return (payload.room ?? payload) as DuelRoom;
}

function messageFromError(error: unknown) {
  if (error instanceof ApiError) {
    const detail = error.body as { detail?: { code?: string; message?: string } } | undefined;
    return detail?.detail?.message ?? `Duel request failed (${error.status}).`;
  }
  return error instanceof Error ? error.message : "The duel service is unavailable.";
}

function updatePlayer(room: DuelRoom, userId: string, update: Partial<DuelPlayer>) {
  return {
    ...room,
    players: room.players.map((player) =>
      player.user_id === userId ? { ...player, ...update } : player,
    ),
  };
}

export function useDuelRoom(roomCode: string) {
  const { authUser } = useUser();
  const [room, setRoom] = useState<DuelRoom | null>(null);
  const [connection, setConnection] = useState<DuelConnectionState>("connecting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submission, setSubmission] = useState<DuelSubmissionResult | null>(null);
  const [result, setResult] = useState<DuelGameResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [readyPending, setReadyPending] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const [opponentState, setOpponentState] = useState<DuelOpponentState>("idle");
  const socketRef = useRef<DuelSocket | null>(null);
  const serverOffsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const opponentIdleTimerRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef(0);

  const currentUserId = authUser?.id ?? room?.current_user_id ?? null;
  const currentUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);
  const currentPlayer = useMemo(
    () => room?.players.find((player) => player.user_id === currentUserId || player.is_you) ?? null,
    [currentUserId, room?.players],
  );
  const opponent = useMemo(
    () => room?.players.find((player) => player.user_id !== currentPlayer?.user_id) ?? null,
    [currentPlayer?.user_id, room?.players],
  );

  const applyEvent = useCallback((event: DuelEvent) => {
    if (process.env.NEXT_PUBLIC_DEBUG_DUEL === "true") console.log("🎮 DUEL EVENT:", event.type, event.payload);
    if (event.server_time) {
      serverOffsetRef.current = Date.parse(event.server_time) - Date.now();
    }
    const payload = payloadOf(event);
    const eventType = event.type.toUpperCase().replace(/[- ]/g, "_");
    if (eventType === "ROOM_STATE" || eventType === "STATE") {
      const nextRoom = roomFromPayload(payload);
      setRoom(nextRoom);
      storeDuelRoomCode(nextRoom.code);
      const nextOpponent = nextRoom.players.find((player) => !player.is_you && player.user_id !== currentUserIdRef.current);
      if (nextOpponent?.is_connected === false) setOpponentState("disconnected");
      else if (nextOpponent?.is_ready) setOpponentState("ready");
      else if (nextOpponent) setOpponentState("joined");
      return;
    }
    if (eventType === "PLAYER_JOINED" || eventType === "OPPONENT_JOINED") {
      const player = (payload.player ?? payload) as DuelPlayer;
      setRoom((current) => current && !current.players.some((item) => item.user_id === player.user_id)
        ? { ...current, players: [...current.players, player] }
        : current);
      if (player.user_id !== currentUserIdRef.current) setOpponentState("joined");
      return;
    }
    if (eventType === "PLAYER_LEFT" || eventType === "OPPONENT_LEFT") {
      const userId = String(payload.user_id ?? "");
      setRoom((current) => current ? { ...current, players: current.players.filter((player) => player.user_id !== userId) } : current);
      if (userId !== currentUserIdRef.current) {
        setOpponentState("left");
        setNotice("Your opponent left the room.");
      }
      return;
    }
    if (eventType === "PLAYER_READY" || eventType === "OPPONENT_READY") {
      const userId = String(payload.user_id ?? "");
      const isReady = Boolean(payload.is_ready ?? payload.ready);
      setRoom((current) => current ? updatePlayer(current, userId, { is_ready: isReady }) : current);
      if (userId !== currentUserIdRef.current && isReady) setOpponentState("ready");
      if (userId !== currentUserIdRef.current && !isReady) setOpponentState("joined");
      return;
    }
    if (eventType === "GAME_STARTING" || eventType === "COUNTDOWN") {
      setRoom((current) => current ? { ...current, status: "READY" } : current);
      setNotice(`Starting in ${Number(payload.countdown_seconds ?? 3)}…`);
      return;
    }
    if (eventType === "GAME_STARTED" || eventType === "GAME_START" || eventType === "ROUND_STARTED" || eventType === "DUEL_STARTED" || eventType === "START_GAME") {
      if (process.env.NEXT_PUBLIC_DEBUG_DUEL === "true") console.log("🎮 Game started — unlocking editor");
      setRoom((current) => current ? {
        ...current,
        status: "ACTIVE",
        started_at: String(payload.started_at ?? payload.startedAt ?? current.started_at ?? ""),
        deadline_at: String(payload.deadline_at ?? payload.deadlineAt ?? current.deadline_at ?? ""),
        duration_seconds: payload.duration_seconds != null ? Number(payload.duration_seconds) : payload.durationMs != null ? Number(payload.durationMs) / 1000 : current.duration_seconds ?? 60,
        challenge: (payload.challenge as DuelRoom["challenge"] | undefined) ?? current.challenge,
      } : current);
      setNotice(null);
      setSubmission(null);
      return;
    }
    if (eventType === "TICK" || eventType === "SERVER_TICK") {
      setRoom((current) => current ? {
        ...current,
        status: (payload.status as DuelRoom["status"] | undefined) ?? current.status,
        started_at: String(payload.started_at ?? payload.startedAt ?? current.started_at ?? ""),
        deadline_at: String(payload.deadline_at ?? payload.deadlineAt ?? current.deadline_at ?? ""),
        duration_seconds: payload.duration_seconds != null ? Number(payload.duration_seconds) : payload.durationMs != null ? Number(payload.durationMs) / 1000 : current.duration_seconds ?? 60,
      } : current);
      return;
    }
    if (eventType === "PLAYER_SUBMITTED" || eventType === "OPPONENT_SUBMITTED") {
      if (String(payload.user_id ?? "") !== currentUserIdRef.current) setOpponentState("submitted");
      setNotice("Your opponent submitted a solution.");
      return;
    }
    if (eventType === "OPPONENT_TYPING" || eventType === "PLAYER_TYPING") {
      if (String(payload.user_id ?? "") === currentUserIdRef.current) return;
      const typing = Boolean(payload.typing);
      setOpponentState(typing ? "typing" : "idle");
      if (opponentIdleTimerRef.current !== null) window.clearTimeout(opponentIdleTimerRef.current);
      if (typing) {
        opponentIdleTimerRef.current = window.setTimeout(() => setOpponentState("idle"), 8000);
      }
      return;
    }
    if (eventType === "SUBMISSION_RESULT") {
      const nextSubmission = payload as unknown as DuelSubmissionResult;
      setSubmission(nextSubmission);
      if (["PASSED", "FAILED", "ERROR"].includes(nextSubmission.status)) {
        setSubmitPending(false);
      }
      return;
    }
    if (eventType === "GAME_OVER" || eventType === "GAME_ENDED") {
      setRoom((current) => current ? { ...current, status: "OVER" } : current);
      setResult(payload as unknown as DuelGameResult);
      setSubmitPending(false);
      return;
    }
    if (eventType === "PLAYER_DISCONNECTED" || eventType === "OPPONENT_DISCONNECTED") {
      const userId = String(payload.user_id ?? "");
      setRoom((current) => current ? updatePlayer(current, userId, { is_connected: false }) : current);
      setNotice("Your opponent disconnected. Waiting for them to reconnect…");
      if (userId !== currentUserIdRef.current) setOpponentState("disconnected");
      return;
    }
    if (eventType === "PLAYER_RECONNECTED" || eventType === "OPPONENT_RECONNECTED") {
      const userId = String(payload.user_id ?? "");
      setRoom((current) => current ? updatePlayer(current, userId, { is_connected: true }) : current);
      setNotice(null);
      if (userId !== currentUserIdRef.current) setOpponentState("joined");
      return;
    }
    if (eventType === "ROOM_EXPIRED") {
      setRoom((current) => current ? { ...current, status: "EXPIRED" } : current);
      setError("This duel room has expired.");
      return;
    }
    if (eventType === "ERROR") {
      const code = String(payload.code ?? "UNKNOWN_ERROR");
      setErrorCode(code);
      setError(String(payload.message ?? "The duel server reported an error."));
    }
  }, []);

  useEffect(() => {
    let active = true;
    const socket = new DuelSocket(
      roomCode,
      async () => (await getDuelWsTicket(roomCode)).ws_ticket,
      (nextState) => {
        if (active) setConnection(nextState);
      },
    );
    socketRef.current = socket;
    const removeAny = socket.on("*", applyEvent);
    const removeFailed = socket.on("RECONNECT_FAILED", () => {
      if (active) setError("Connection lost. Return to the lobby and try again.");
    });

    void getDuelRoom(roomCode)
      .then((nextRoom) => {
        if (!active) return;
        setRoom(nextRoom);
        storeDuelRoomCode(nextRoom.code);
        socket.setLastSequence(nextRoom.sequence ?? 0);
        setLoading(false);
        socket.connect();
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(messageFromError(loadError));
        setErrorCode(duelErrorCode(loadError));
        setLoading(false);
      });

    return () => {
      active = false;
      removeAny();
      removeFailed();
      socket.close();
      socketRef.current = null;
    };
  }, [applyEvent, roomCode]);

  useEffect(() => {
    if (!room || !["OVER", "EXPIRED", "CANCELLED"].includes(room.status)) return;
    socketRef.current?.close();
    void getDuelResult(roomCode).then(setResult).catch(() => undefined);
  }, [room, roomCode]);

  useEffect(() => {
    const tick = () => {
      setRemainingSeconds(secondsRemaining(room?.deadline_at, Date.now() + serverOffsetRef.current, room?.started_at, room?.duration_seconds));
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [room?.deadline_at, room?.duration_seconds, room?.started_at]);

  const ready = useCallback(async () => {
    if (readyPending || !room || room.status !== "WAITING") return;
    setReadyPending(true);
    setError(null);
    setErrorCode(null);
    try {
      socketRef.current?.send("READY");
      await setDuelReady(roomCode);
    } catch (readyError) {
      setError(messageFromError(readyError));
      setErrorCode(duelErrorCode(readyError));
    } finally {
      setReadyPending(false);
    }
  }, [readyPending, room, roomCode]);

  const runTests = useCallback(async (code: string) => {
    if (!room) throw new Error("The duel room is not loaded.");
    const language = room.challenge.language ?? room.language;
    setSubmission({ submission_id: "visible-tests", status: "RUNNING" });
    try {
      const nextSubmission = await runDuelTests(roomCode, language, code);
      setSubmission(nextSubmission);
      return nextSubmission;
    } catch (testError) {
      const message = messageFromError(testError);
      setSubmission({ submission_id: "visible-tests", status: "ERROR", error: message });
      throw testError;
    }
  }, [room, roomCode]);

  const sendTyping = useCallback((typing: boolean) => {
    if (!room || room.status !== "ACTIVE") return;
    const now = Date.now();
    if (typing && now - lastTypingSentRef.current < 500) {
      if (typingTimerRef.current !== null) window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => {
        lastTypingSentRef.current = Date.now();
        socketRef.current?.send("PLAYER_TYPING", { typing: true });
      }, 500);
      return;
    }
    lastTypingSentRef.current = now;
    socketRef.current?.send("PLAYER_TYPING", { typing });
    if (typingTimerRef.current !== null) window.clearTimeout(typingTimerRef.current);
    if (typing) typingTimerRef.current = window.setTimeout(() => {
      lastTypingSentRef.current = Date.now();
      socketRef.current?.send("PLAYER_TYPING", { typing: false });
    }, 1500);
  }, [room]);

  useEffect(() => () => {
    if (typingTimerRef.current !== null) window.clearTimeout(typingTimerRef.current);
    if (opponentIdleTimerRef.current !== null) window.clearTimeout(opponentIdleTimerRef.current);
  }, []);

  const submit = useCallback(async (code: string) => {
    if (!room || submitPending || room.status !== "ACTIVE") return;
    setSubmitPending(true);
    setSubmission({ submission_id: "pending", status: "QUEUED" });
    try {
      const language = room.challenge.language ?? room.language;
      const acknowledgement = await submitDuelCode(roomCode, language, code);
      setSubmission({ submission_id: acknowledgement.submission_id, status: acknowledgement.status });
    } catch (submitError) {
      setSubmitPending(false);
      setSubmission({ submission_id: "failed", status: "ERROR", error: messageFromError(submitError) });
    }
  }, [room, roomCode, submitPending]);

  const leave = useCallback(async () => {
    await leaveDuelRoom(roomCode);
  }, [roomCode]);

  const refreshResult = useCallback(async () => {
    try {
      setResult(await getDuelResult(roomCode));
    } catch {
      // GAME_OVER already carries the final result; this is only a refresh fallback.
    }
  }, [roomCode]);

  return {
    room,
    opponent,
    currentPlayer,
    connection,
    loading,
    error: error ?? (room?.status === "EXPIRED" ? "This duel room has expired." : room?.status === "CANCELLED" ? "This duel was cancelled." : null),
    errorCode,
    notice,
    submission,
    result,
    remainingSeconds,
    readyPending,
    submitPending,
    ready,
    runTests,
    submit,
    sendTyping,
    opponentState,
    leave,
    refreshResult,
  };
}

export { messageFromError };
