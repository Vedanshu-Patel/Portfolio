let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  return audioContext;
}

export type SoundType = 'click' | 'hover' | 'toggle';

const SOUND_CONFIG: Record<
  SoundType,
  { freq: number; duration: number; type: OscillatorType; volume: number }
> = {
  click: { freq: 620, duration: 0.06, type: 'sine', volume: 0.08 },
  hover: { freq: 880, duration: 0.03, type: 'sine', volume: 0.04 },
  toggle: { freq: 440, duration: 0.1, type: 'triangle', volume: 0.1 },
};

export function playSound(type: SoundType) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const cfg = SOUND_CONFIG[type];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = cfg.type;
  osc.frequency.value = cfg.freq;

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(cfg.volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + cfg.duration);
}
