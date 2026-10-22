/**
 * Utility for playing crisp notification audio chimes using Browser Web Audio API.
 * Requires 0 external assets, zero bandwidth, and works reliably offline.
 */

const ORDER_SOUND_STORAGE_KEY = 'jj_admin_order_sound';

export const isOrderSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(ORDER_SOUND_STORAGE_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
};

export const setOrderSoundEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDER_SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('jj_order_sound_setting_changed', { detail: enabled }));
  } catch {}
};

/**
 * Plays a pleasant, crisp 2-tone melodic chime (Ding-Dong)
 * Frequency Tone 1: 1318.5 Hz (E6)
 * Frequency Tone 2: 987.77 Hz (B5)
 */
export const playOrderChime = (force: boolean = false): void => {
  if (typeof window === 'undefined') return;
  if (!force && !isOrderSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const startTime = ctx.currentTime;

    // Tone 1: High crisp Bell (E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, startTime);
    
    // Add harmonic brightness
    gain1.gain.setValueAtTime(0, startTime);
    gain1.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(startTime);
    osc1.stop(startTime + 0.45);

    // Tone 2: Warm pleasant Bell (B5 / 987.77Hz)
    const tone2Start = startTime + 0.16;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, tone2Start);

    gain2.gain.setValueAtTime(0, tone2Start);
    gain2.gain.linearRampToValueAtTime(0.42, tone2Start + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, tone2Start + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(tone2Start);
    osc2.stop(tone2Start + 0.65);
  } catch (err) {
    console.error('Audio chime play error:', err);
  }
};
