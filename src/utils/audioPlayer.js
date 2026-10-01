/**
 * Ambient Romantic Audio Engine
 * Combines:
 * 1. Web Audio API warm lo-fi romantic chord synthesis (works offline, 100% reliable, zero external MP3 dependencies)
 * 2. Optional custom audio URL playback if configured in settings.
 */

class RomanticAudioPlayer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.customAudio = null;
    this.chordIndex = 0;

    // Romantic chord progression (frequencies in Hz):
    // Cmaj7 -> Fmaj7 -> Am9 -> Gsus4
    this.chords = [
      [261.63, 329.63, 392.00, 493.88], // C E G B (Cmaj7)
      [174.61, 261.63, 329.63, 440.00], // F C E A (Fmaj7)
      [220.00, 261.63, 329.63, 392.00, 493.88], // A C E G B (Am9)
      [196.00, 261.63, 293.66, 392.00], // G C D G (Gsus4)
    ];
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChord(frequencies) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    
    // Master soft warm filter for intimate lo-fi feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(1.2, now);
    filter.connect(this.ctx.destination);

    frequencies.forEach((freq, idx) => {
      // Primary soft tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle acoustic attack and long, warm romantic decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045 / frequencies.length, now + 0.8 + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now + idx * 0.08);
      osc.stop(now + 4.8);
    });
  }

  scheduleNextChord() {
    if (!this.isPlaying) return;
    const currentChord = this.chords[this.chordIndex];
    this.playChord(currentChord);
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    this.timerId = window.setTimeout(() => {
      this.scheduleNextChord();
    }, 4000);
  }

  start(customUrl = null) {
    if (this.isPlaying) return;

    if (customUrl && typeof customUrl === 'string' && customUrl.trim().length > 0) {
      try {
        if (!this.customAudio) {
          this.customAudio = new Audio(customUrl.trim());
          this.customAudio.loop = true;
        } else if (this.customAudio.src !== customUrl.trim()) {
          this.customAudio.src = customUrl.trim();
        }
        this.customAudio.play().then(() => {
          this.isPlaying = true;
        }).catch(() => {
          // If custom URL fails (e.g. CORS/offline), fallback gracefully to Web Audio
          this.fallbackToWebAudio();
        });
        return;
      } catch {
        this.fallbackToWebAudio();
        return;
      }
    }

    this.fallbackToWebAudio();
  }

  fallbackToWebAudio() {
    this.initContext();
    this.isPlaying = true;
    this.scheduleNextChord();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  toggle(customUrl = null) {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(customUrl);
      return true;
    }
  }
}

export const romanticAudio = new RomanticAudioPlayer();
