/**
 * S.Y.N.T.A.X. Web Audio Synthesizer & Mobile Haptic Engine
 * 
 * Features:
 * - 432 Hz Sine-Bleeps on successful validation
 * - Mechanical tactile acoustic clicks when typing in passkey fields
 * - Warmer, deep synth-chime on final transaction completion
 * - Mobile Haptik (Vibration API) micro-rumble (e.g. navigator.vibrate(10))
 * - Muffled low-frequency error tone when mandatory fields are missing
 * - Discreet Audio-Toggle with state persistence (default: MUTED)
 */

export interface AudioSynthOptions {
  isSoundEnabled: boolean;
}

const STORAGE_KEY = "syntax_audio_sound_enabled_v1";

// Default is muted as requested ("standardmäßig gemutet mit Lautsprecher-Toggle")
let soundEnabled = false;

// Initialize from localStorage safely
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    soundEnabled = saved === "true"; // Defaults to false if null or not "true"
  } catch {
    soundEnabled = false;
  }
}

// AudioContext singleton (lazy instantiation on user interaction)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn("Web Audio API not supported or restricted:", e);
    return null;
  }
}

// Event listeners for state changes
type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();

export function isAudioEnabled(): boolean {
  return soundEnabled;
}

export function setAudioEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {}
  listeners.forEach((fn) => fn(soundEnabled));

  if (enabled) {
    // Play warm confirmation chime when user turns sound ON
    setTimeout(() => {
      playValidationBeep();
    }, 50);
  }
}

export function toggleAudioEnabled(): boolean {
  const next = !soundEnabled;
  setAudioEnabled(next);
  return next;
}

export function subscribeAudioState(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Mobile Haptik via Vibration API (Micro-Rumble)
 * e.g. navigator.vibrate(10) on smartphone
 */
export function triggerHaptic(pattern: number | number[] = 10): void {
  try {
    if (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator &&
      typeof navigator.vibrate === "function"
    ) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Gracefully ignore if device doesn't allow haptics
  }
}

/**
 * 1. Subtile, futuristische Klick- und Bestätigungstöne
 * (432 Hz Sine-Bleeps bei erfolgreicher Validierung)
 */
export function playValidationBeep(): void {
  triggerHaptic(10); // Micro-rumble 10ms
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // 432 Hz fundamental frequency
    osc.frequency.setValueAtTime(432, now);
    // Subtle futuristic harmonic sweep to 864 Hz
    osc.frequency.exponentialRampToValueAtTime(864, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    console.debug("Audio synth validation beep failed:", e);
  }
}

/**
 * 2. Mechanical Keypress Sounds
 * Optionales leises taktiles Akustik-Feedback beim Tippen in die Passkey-Felder
 */
let lastKeypressTime = 0;
export function playKeypressSound(): void {
  // Prevent audio clipping on super-fast typing bursts (> 15ms limit)
  const nowMs = performance.now();
  if (nowMs - lastKeypressTime < 18) return;
  lastKeypressTime = nowMs;

  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Component A: Tactile click (bandpassed high click)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    clickOsc.type = "triangle";
    const baseFreq = 1900 + Math.random() * 350;
    clickOsc.frequency.setValueAtTime(baseFreq, now);
    clickOsc.frequency.exponentialRampToValueAtTime(950, now + 0.012);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(3.2, now);

    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.linearRampToValueAtTime(0.032, now + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    clickOsc.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.022);

    // Component B: Bottom-out gentle chassis thud (100Hz)
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = "sine";
    thumpOsc.frequency.setValueAtTime(115 + Math.random() * 20, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(55, now + 0.02);

    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.linearRampToValueAtTime(0.025, now + 0.003);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    thumpOsc.start(now);
    thumpOsc.stop(now + 0.025);
  } catch (e) {
    console.debug("Audio synth keypress sound failed:", e);
  }
}

/**
 * 3. Erfolgs-Fanfare
 * Ein warmer, tiefer Synth-Chime beim finalen Abschluss der Transaktion
 */
export function playSuccessFanfare(): void {
  // Mobile haptic fanfare sequence
  triggerHaptic([20, 40, 20, 60, 30]);

  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Harmonious warm major chord: 108 Hz (A2 sub), 216 Hz, 324 Hz, 432 Hz, 648 Hz, 864 Hz
    const freqs = [108, 216, 324, 432, 648, 864];
    const masterGain = ctx.createGain();

    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.14, now + 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    // Warm resonant lowpass filter
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(650, now);
    lpf.frequency.exponentialRampToValueAtTime(2200, now + 0.18);
    lpf.frequency.exponentialRampToValueAtTime(350, now + 1.7);
    lpf.Q.setValueAtTime(1.8, now);

    masterGain.connect(lpf);
    lpf.connect(ctx.destination);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = idx === 0 ? "sine" : idx % 2 === 0 ? "triangle" : "sine";
      const detune = (idx - 2.5) * 5; // Detuned chorus warmth
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      const vol = idx === 0 ? 0.35 : 0.22 / Math.sqrt(idx + 1);
      oscGain.gain.setValueAtTime(vol, now);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      // Stagger slightly for an elegant arpeggiated chime
      const startTime = now + idx * 0.025;
      osc.start(startTime);
      osc.stop(now + 1.8);
    });
  } catch (e) {
    console.debug("Audio synth success fanfare failed:", e);
  }
}

/**
 * 4. Fehler-Klangfarbe
 * Ein gedämpfter Low-Frequency-Tone, falls ein Pflichtfeld vergessen wurde
 */
export function playErrorTone(): void {
  // Mobile micro-rumble error pattern
  triggerHaptic([35, 45, 25]);

  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Muffled low-frequency pitch drop: 140 Hz down to 75 Hz
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);

    // Warm lowpass filter to dampen the tone
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, now);
    filter.Q.setValueAtTime(1.2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.debug("Audio synth error tone failed:", e);
  }
}

/**
 * Futuristic subtle micro-click for interactive buttons
 */
export function playClickSound(): void {
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.018);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {}
}
