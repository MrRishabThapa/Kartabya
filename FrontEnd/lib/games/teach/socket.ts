export type TeachSocketPayload = Record<string, unknown>;

const EVENT_ALIASES: Record<string, string> = {
  'response.audio.delta': 'ai_audio_delta',
  'response.output_audio.delta': 'ai_audio_delta',
  'response.output_audio_delta': 'ai_audio_delta',
  'response.audio.done': 'ai_audio_done',
  'response.output_audio.done': 'ai_audio_done',
  'response.output_audio_done': 'ai_audio_done',
  'response.audio_transcript.delta': 'ai_text_delta',
  'response.output_audio_transcription.delta': 'ai_text_delta',
  'response.output_audio_transcript.delta': 'ai_text_delta',
  'response.audio_transcript.done': 'ai_text_done',
  'response.output_audio_transcription.done': 'ai_text_done',
  'response.output_audio_transcript.done': 'ai_text_done',
  'response.done': 'ai_response_done',
  'response.created': 'ai_response_created',
  'conversation.item.input_audio_transcription.completed': 'user_text_done',
  'conversation.item.input_audio_transcript.completed': 'user_text_done',
  'conversation.item.input_audio_transcription.delta': 'user_text_delta',
  'conversation.item.input_audio_transcript.delta': 'user_text_delta',
  'session.ended': 'session_ended',
  'response.cancelled': 'response_cancelled',
  'teach.qna_complete': 'qna_complete',
  'teach.questions_complete': 'qna_complete',
};

export function normalizeTeachEventType(type: string) {
  return EVENT_ALIASES[type] ?? type;
}

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
    const originalClose = socket.close.bind(socket);
    socket.close = (code?: number, reason?: string) => {
      console.trace('🦊 ws.close() CALLED with:', code, reason);
      return originalClose(code, reason);
    };
    socket.addEventListener('open', () => {
      if (this.closed) {
        socket.close(1000, 'cancelled before use');
        return;
      }
      this.handlers.open?.();
    });
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

  get readyState() {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  close(code = 1000, reason = 'client leaving') {
    if (this.closed) return;
    this.closed = true;
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.close(code, reason);
    this.socket = null;
  }
}
