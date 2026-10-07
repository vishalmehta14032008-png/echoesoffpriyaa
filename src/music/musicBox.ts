/**
 * A tiny generative music box (Web Audio). Used only when the real song
 * file isn't available, so the experience is never silent.
 */
const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Fmaj7 → Em7 → Dm7 → G, arpeggiated like a lullaby.
const BARS = [
  { arp: [53, 60, 64, 69, 72, 69], top: 76 },
  { arp: [52, 59, 62, 67, 71, 67], top: 74 },
  { arp: [50, 57, 60, 65, 69, 65], top: 72 },
  { arp: [55, 62, 65, 71, 74, 71], top: 71 },
];
const STEP = 60 / 68 / 2; // eighth notes at 68 bpm

export class MusicBox {
  ctx: AudioContext;
  master: GainNode;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;

  constructor() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    // Soft shimmer: a gentle feedback delay into a lowpass.
    const delay = this.ctx.createDelay(1);
    delay.delayTime.value = STEP * 3;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.32;
    const tone = this.ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2600;
    this.master.connect(tone);
    tone.connect(this.ctx.destination);
    this.master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(tone);
  }

  private note(freq: number, time: number, gain: number, length = 1.8) {
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 2;
    const g2 = this.ctx.createGain();
    g2.gain.value = 0.18;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(gain, time + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(env);
    osc2.connect(g2).connect(env);
    env.connect(this.master);
    osc.start(time);
    osc2.start(time);
    osc.stop(time + length + 0.05);
    osc2.stop(time + length + 0.05);
  }

  private schedule = () => {
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const bar = BARS[Math.floor(this.step / 6) % BARS.length];
      const i = this.step % 6;
      this.note(midi(bar.arp[i]), this.nextTime, i === 0 ? 0.22 : 0.13);
      if (i === 0 && Math.floor(this.step / 6) % 2 === 0) this.note(midi(bar.top), this.nextTime + STEP * 0.02, 0.1, 2.6);
      if (i === 3) this.note(midi(bar.top - 12 + 2), this.nextTime, 0.06, 1.4);
      this.nextTime += STEP;
      this.step++;
    }
  };

  play(volume: number) {
    void this.ctx.resume();
    if (this.timer === null) {
      this.nextTime = this.ctx.currentTime + 0.08;
      this.timer = window.setInterval(this.schedule, 90);
    }
    this.setVolume(volume, 2);
  }

  pause() {
    this.setVolume(0, 0.4);
    window.setTimeout(() => {
      if (this.timer !== null) window.clearInterval(this.timer);
      this.timer = null;
      void this.ctx.suspend();
    }, 450);
  }

  setVolume(v: number, ramp = 0.15) {
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(v * 0.55, now + ramp);
  }
}
