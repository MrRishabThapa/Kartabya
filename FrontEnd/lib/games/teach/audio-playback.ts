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
  private nextStart = 0;

  play(base64: string) {
    const context = this.context ?? new AudioContext({ sampleRate: 24000 });
    this.context = context;
    void context.resume().catch(() => undefined);
    const samples = decodePcm16(base64);
    const buffer = context.createBuffer(1, samples.length, 24000);
    buffer.copyToChannel(samples, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    this.nextStart = Math.max(this.nextStart, context.currentTime) + buffer.duration;
    source.start(this.nextStart - buffer.duration);
  }

  async stop() {
    if (this.context) await this.context.close();
    this.context = null;
    this.nextStart = 0;
  }
}
