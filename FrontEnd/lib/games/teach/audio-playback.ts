function decodePcm16(base64: string) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(Math.floor(bytes.byteLength / 2));
  samples.forEach((_, index) => { samples[index] = view.getInt16(index * 2, true) / 32768; });
  return samples;
}

export class TeachAudioPlayback {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nextStart = 0;
  private cancelled = false;
  private activeSources = new Set<AudioBufferSourceNode>();
  private stopTimer: number | null = null;
  private stopPromise: Promise<void> | null = null;

  play(base64: string) {
    if (this.cancelled) this.cancelled = false;
    const context = this.context ?? new AudioContext({ sampleRate: 24000 });
    this.context = context;
    if (!this.masterGain) {
      this.masterGain = context.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(context.destination);
    }
    void context.resume().catch(() => undefined);
    const samples = decodePcm16(base64);
    if (this.cancelled) return;
    const buffer = context.createBuffer(1, samples.length, 24000);
    buffer.copyToChannel(samples, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
    const startAt = Math.max(this.nextStart, context.currentTime);
    this.nextStart = startAt + buffer.duration;
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
      try { source.disconnect(); } catch {}
    };
    source.start(startAt);
  }

  async stop(fadeMs = 30) {
    if (this.stopPromise) return this.stopPromise;
    this.stopPromise = this.stopInternal(fadeMs);
    try {
      await this.stopPromise;
    } finally {
      this.stopPromise = null;
    }
  }

  private async stopInternal(fadeMs: number) {
    this.cancelled = true;
    if (this.stopTimer !== null) window.clearTimeout(this.stopTimer);
    const context = this.context;
    if (!context) {
      this.nextStart = 0;
      this.activeSources.clear();
      return;
    }
    const now = context.currentTime;
    if (this.masterGain) {
      try {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
      } catch {}
    }
    await new Promise<void>((resolve) => {
      this.stopTimer = window.setTimeout(resolve, fadeMs + 5);
    });
    this.activeSources.forEach((source) => {
      try { source.stop(); } catch {}
      try { source.disconnect(); } catch {}
    });
    this.activeSources.clear();
    this.nextStart = 0;
    if (this.masterGain) {
      try {
        this.masterGain.gain.cancelScheduledValues(context.currentTime);
        this.masterGain.gain.setValueAtTime(1, context.currentTime);
      } catch {}
    }
    await context.close().catch(() => undefined);
    this.context = null;
    this.masterGain = null;
    this.stopTimer = null;
  }
}
