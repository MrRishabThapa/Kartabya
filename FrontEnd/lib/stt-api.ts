import { API_URL, api, apiFetch, ApiError } from '@/lib/api';

type RecordedTranscription = { text?: string; model?: string; detail?: string };

export function getSupportedRecordingMimeType() {
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  return '';
}

export async function transcribeRecordedAudio(file: File, prompt?: string, languages = 'en', retry = true) {
  const formData = new FormData();
  formData.append('file', file, file.name);
  if (prompt) formData.append('prompt', prompt);
  if (languages) formData.append('languages', languages);

  const response = await apiFetch('/api/v1/stt/transcribe?stream=false', {
    method: 'POST',
    body: formData,
  });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson
    ? await response.json() as RecordedTranscription
    : await response.text();
  if (response.status === 401 && retry) {
    try {
      await api.post('/api/v1/auth/refresh');
      return transcribeRecordedAudio(file, prompt, languages, false);
    } catch {
      // Fall through to the normal authenticated error below.
    }
  }
  if (!response.ok) throw new ApiError(response.status, body);
  if (typeof body === 'string') throw new ApiError(response.status || 502, body);
  return body;
}

/** Starts an SSE transcription upload. The caller owns reading response.body. */
export function transcribeStreamingAudio(file: File, prompt?: string, languages = 'en') {
  const formData = new FormData();
  formData.append('file', file, file.name);
  if (prompt) formData.append('prompt', prompt);
  if (languages) formData.append('languages', languages);

  return apiFetch('/api/v1/stt/transcribe?stream=true', {
    method: 'POST',
    body: formData,
  }).then((response) => {
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('text/event-stream')) {
      throw new ApiError(response.status, { detail: 'STT streaming endpoint returned a non-SSE response.' });
    }
    return response;
  });
}

export function realtimeSocketUrl() {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not configured');
  const apiUrl = new URL(API_URL);
  const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${apiUrl.host}/api/v1/stt/realtime?ngrok-skip-browser-warning=true`;
}
