export type DuelStatus =
  | "WAITING"
  | "READY"
  | "ACTIVE"
  | "OVER"
  | "CANCELLED"
  | "EXPIRED";

export type DuelLanguage = "python" | "c" | "cpp" | "javascript" | "typescript";

export type DuelPlayer = {
  user_id: string;
  name?: string | null;
  avatar_url?: string | null;
  is_ready: boolean;
  is_connected?: boolean;
  is_you?: boolean;
};

export type DuelChallenge = {
  id?: string;
  language?: DuelLanguage;
  title: string;
  description: string;
  starter_code: string;
  buggy_code?: string | null;
  function_name?: string | null;
  target_output?: string | null;
};

export type DuelRoom = {
  id: string;
  code: string;
  status: DuelStatus;
  language: DuelLanguage;
  challenge: DuelChallenge;
  players: DuelPlayer[];
  started_at?: string | null;
  deadline_at?: string | null;
  duration_seconds?: number | null;
  current_user_id?: string | null;
  sequence?: number;
};

export type DuelRoomResponse = {
  room: DuelRoom;
  ws_ticket?: string;
};

export type DuelEventType =
  | "ROOM_STATE"
  | "PLAYER_JOINED"
  | "PLAYER_LEFT"
  | "PLAYER_READY"
  | "GAME_STARTING"
  | "GAME_STARTED"
  | "OPPONENT_TYPING"
  | "PLAYER_TYPING"
  | "PLAYER_SUBMITTED"
  | "SUBMISSION_RESULT"
  | "PLAYER_DISCONNECTED"
  | "PLAYER_RECONNECTED"
  | "GAME_OVER"
  | "ROOM_EXPIRED"
  | "ERROR"
  | "PONG";

export type DuelEvent<TPayload = Record<string, unknown>> = {
  type: DuelEventType | string;
  sequence?: number;
  server_time?: string;
  payload?: TPayload;
};

export type DuelSubmissionStatus =
  | "QUEUED"
  | "RUNNING"
  | "PASSED"
  | "FAILED"
  | "ERROR";

export type DuelTestResult = {
  name: string;
  passed: boolean;
  output?: string | null;
  error?: string | null;
};

export type DuelSubmissionResult = {
  submission_id: string;
  status: DuelSubmissionStatus;
  passed?: boolean;
  visible_tests?: DuelTestResult[];
  error?: string | null;
};

export type DuelGameResult = {
  winner_user_id?: string | null;
  reason: string;
  players?: DuelPlayer[];
  xp_awarded?: number | null;
  completed_at?: string | null;
};

export type DuelConnectionState = "connecting" | "connected" | "reconnecting" | "disconnected";

export type DuelOpponentState =
  | "joined"
  | "typing"
  | "idle"
  | "ready"
  | "submitted"
  | "disconnected"
  | "reconnecting"
  | "left";

export function secondsRemaining(
  deadlineAt: string | null | undefined,
  now = Date.now(),
  startedAt?: string | null,
  durationSeconds?: number | null,
) {
  const deadline = deadlineAt
    ? Date.parse(deadlineAt)
    : startedAt && durationSeconds
      ? Date.parse(startedAt) + durationSeconds * 1000
      : NaN;
  if (!Number.isFinite(deadline)) return 0;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
