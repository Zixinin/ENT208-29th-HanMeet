export class RetroAudioSystem {
  private context: AudioContext | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.context) {
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.context = new Ctx();
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }

    return this.context;
  }

  private tone(startFreq: number, endFreq: number, duration = 0.12, type: OscillatorType = 'square', gain = 0.03, offset = 0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + offset;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(amp);
    amp.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playPickup(): void {
    this.tone(1040, 620, 0.09, 'square', 0.03);
    this.tone(880, 540, 0.08, 'triangle', 0.025, 0.04);
  }

  playQuestComplete(): void {
    this.tone(660, 880, 0.12, 'square', 0.04, 0);
    this.tone(880, 1170, 0.12, 'square', 0.04, 0.08);
    this.tone(990, 1320, 0.14, 'triangle', 0.05, 0.16);
  }

  playUiClick(): void {
    this.tone(520, 420, 0.06, 'square', 0.02);
  }
}
