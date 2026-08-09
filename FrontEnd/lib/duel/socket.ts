import type { DuelEvent, DuelConnectionState } from "@/lib/duel/types";

type EventHandler = (event: DuelEvent) => void;

const debugDuel = process.env.NEXT_PUBLIC_DEBUG_DUEL === "true";

function buildDuelWebSocketUrl(roomCode: string, ticket: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const url = new URL(apiUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/api/v1/duels/rooms/${encodeURIComponent(roomCode)}/ws`;
  url.search = "";
  url.searchParams.set("ticket", ticket);
  url.searchParams.set("ngrok-skip-browser-warning", "true");
  return url.toString();
}

export class DuelSocket {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectAttempt = 0;
  private closed = false;
  private lastSequence = 0;
  private readonly maxReconnectAttempts = 12;

  constructor(
    private readonly roomCode: string,
    private readonly getTicket: () => Promise<string>,
    private readonly setConnectionState: (state: DuelConnectionState) => void,
  ) {}

  on(type: string, handler: EventHandler) {
    const handlers = this.handlers.get(type) ?? new Set<EventHandler>();
    handlers.add(handler);
    this.handlers.set(type, handlers);
    return () => this.off(type, handler);
  }

  off(type: string, handler: EventHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  connect() {
    this.closed = false;
    void this.open();
  }

  close() {
    this.closed = true;
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.socket?.close(1000, "component unmounted");
    this.socket = null;
    this.setConnectionState("disconnected");
  }

  send(type: string, payload: Record<string, unknown> = {}) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    if (debugDuel) console.log("🎮 WS SEND:", type, payload);
    this.socket.send(JSON.stringify({
      type,
      client_event_id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      payload,
    }));
    return true;
  }

  getLastSequence() {
    return this.lastSequence;
  }

  setLastSequence(sequence: number) {
    this.lastSequence = Math.max(0, sequence);
  }

  private async open() {
    if (this.closed) return;
    this.setConnectionState(this.reconnectAttempt ? "reconnecting" : "connecting");
    try {
      const ticket = await this.getTicket();
      if (this.closed) return;
      const wsUrl = buildDuelWebSocketUrl(this.roomCode, ticket);
      if (debugDuel) console.log("🎮 WS opening:", wsUrl);
      const socket = new WebSocket(wsUrl);
      this.socket = socket;
      socket.onopen = () => {
        if (debugDuel) console.log("🎮 WS OPEN");
        this.reconnectAttempt = 0;
        this.setConnectionState("connected");
        this.send("JOIN_ROOM", { room_code: this.roomCode });
        this.send("REQUEST_STATE", { last_sequence: this.lastSequence });
        this.heartbeatTimer = window.setInterval(() => this.send("PING"), 25000);
      };
      socket.onmessage = (message) => {
        if (debugDuel) console.log("🎮 WS MSG:", message.data);
        this.receive(message.data);
      };
      socket.onerror = (event) => {
        if (debugDuel) console.log("🎮 WS ERROR:", event);
        socket.close();
      };
      socket.onclose = (event) => {
        if (debugDuel) console.log("🎮 WS CLOSE:", event.code, event.reason);
        if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
        this.socket = null;
        if (!this.closed) this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private receive(raw: string) {
    try {
      const event = JSON.parse(raw) as DuelEvent;
      if (typeof event.sequence === "number") {
        if (event.sequence <= this.lastSequence) return;
        this.lastSequence = event.sequence;
      }
      this.handlers.get(event.type)?.forEach((handler) => handler(event));
      this.handlers.get("*")?.forEach((handler) => handler(event));
      const errorCode = typeof event.payload?.code === "string" ? event.payload.code : "";
      if (event.type === "ERROR" && ["INVALID_TICKET", "TICKET_EXPIRED", "AUTH_REQUIRED"].includes(errorCode)) {
        this.socket?.close(4001, errorCode);
      }
    } catch {
      this.handlers.get("ERROR")?.forEach((handler) => handler({ type: "ERROR", payload: { code: "INVALID_EVENT", message: "Received an invalid duel event." } }));
    }
  }

  private scheduleReconnect() {
    if (this.closed) return;
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this.setConnectionState("disconnected");
      this.handlers.get("RECONNECT_FAILED")?.forEach((handler) => handler({ type: "RECONNECT_FAILED" }));
      return;
    }
    const delay = Math.min(15000, 1000 * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.setConnectionState("reconnecting");
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      void this.open();
    }, delay);
  }
}

export { buildDuelWebSocketUrl };
