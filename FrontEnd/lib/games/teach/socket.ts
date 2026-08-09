export type TeachSocketPayload = Record<string, unknown>;

type SocketHandlers = {
  open?: () => void;
  message?: (payload: TeachSocketPayload) => void;
  close?: (event: CloseEvent) => void;
  error?: () => void;
};

export class TeachSocket {
  private socket: WebSocket | null = null;
  private closed = false;

  constructor(private readonly url: string, private readonly handlers: SocketHandlers) {}

  open() {
    this.closed = false;
    this.connect();
  }

  private connect() {
    if (this.closed) return;
    const socket = new WebSocket(this.url);
    this.socket = socket;
    socket.addEventListener('open', () => this.handlers.open?.());
    socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as TeachSocketPayload;
        this.handlers.message?.(payload);
      } catch {
        // Ignore malformed server events.
      }
    });
    socket.addEventListener('error', () => this.handlers.error?.());
    socket.addEventListener('close', (event) => {
      this.handlers.close?.(event);
    });
  }

  send(payload: object) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  close(code = 1000, reason = 'client leaving') {
    this.closed = true;
    this.socket?.close(code, reason);
    this.socket = null;
  }
}
