import { api } from "@/lib/api";
import type {
  DuelLanguage,
  DuelRoom,
  DuelRoomResponse,
  DuelSubmissionResult,
} from "@/lib/duel/types";
import { ApiError } from "@/lib/api";

const roomPath = (roomCode: string) =>
  `/api/v1/duels/rooms/${encodeURIComponent(roomCode)}`;

export const DUEL_ROOM_STORAGE_KEY = "adaptiv.duel.room_code";

export function storeDuelRoomCode(roomCode: string) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(DUEL_ROOM_STORAGE_KEY, roomCode);
}

export function getStoredDuelRoomCode() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(DUEL_ROOM_STORAGE_KEY);
}

export function clearStoredDuelRoomCode() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(DUEL_ROOM_STORAGE_KEY);
}

export function messageFromError(error: unknown) {
  if (error instanceof ApiError) {
    const detail = error.body as { detail?: { message?: string } } | undefined;
    return detail?.detail?.message ?? `Duel request failed (${error.status}).`;
  }
  return error instanceof Error ? error.message : "The duel service is unavailable.";
}

export function duelErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.body as { detail?: { code?: string } } | undefined;
  return body?.detail?.code ?? null;
}

function unwrapRoom(response: DuelRoom | DuelRoomResponse) {
  return "room" in response ? response.room : response;
}

export function createDuelRoom(language: DuelLanguage) {
  return api.post("/api/v1/duels/rooms", { language }) as Promise<DuelRoomResponse>;
}

export function joinDuelRoom(roomCode: string) {
  return api.post(`${roomPath(roomCode)}/join`) as Promise<DuelRoomResponse>;
}

export async function getDuelRoom(roomCode: string) {
  const response = (await api.get(roomPath(roomCode))) as DuelRoom | DuelRoomResponse;
  return unwrapRoom(response);
}

export function getDuelWsTicket(roomCode: string) {
  return api.post(`${roomPath(roomCode)}/ws-ticket`) as Promise<{ ws_ticket: string }>;
}

export function setDuelReady(roomCode: string) {
  return api.post(`${roomPath(roomCode)}/ready`) as Promise<{
    status: DuelRoom["status"];
    all_players_ready: boolean;
  }>;
}

export function leaveDuelRoom(roomCode: string) {
  return api.post(`${roomPath(roomCode)}/leave`);
}

export function runDuelTests(roomCode: string, language: DuelLanguage, code: string) {
  return api.post(`${roomPath(roomCode)}/run-tests`, { language, code }) as Promise<DuelSubmissionResult>;
}

export function submitDuelCode(roomCode: string, language: DuelLanguage, code: string) {
  return api.post(`${roomPath(roomCode)}/submit`, { language, code }) as Promise<{
    submission_id: string;
    status: "QUEUED";
  }>;
}

export function getDuelResult(roomCode: string) {
  return api.get(`${roomPath(roomCode)}/result`) as Promise<import("@/lib/duel/types").DuelGameResult>;
}

export function getDuelHistory() {
  return api.get("/api/v1/duels/history") as Promise<unknown[]>;
}
