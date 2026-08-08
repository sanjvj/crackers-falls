import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, Flame, RefreshCw } from 'lucide-react';

interface CrackerBurstCanvasProps {
  active: boolean;
  onComplete?: () => void;
}

export const CrackerBurstCanvas: React.FC<CrackerBurstCanvasProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic festive cracker sound using Web Audio API
  const playCrackerSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create noise burst for firework crackle
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      // Additional low bass boom for rocket pop
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);

      oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio playback not allowed or supported', e);
    }
  };

  const triggerFireworkShow = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    // Helper for random in range
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // 1. Initial Blast of Golden Confetti
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ef4444', '#22d3ee']
    });

    playCrackerSound();

    // 2. Interval rockets from left and right
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
        return;
      }

      const particleCount = 40 * (timeLeft / duration);

      // Rocket from left
      confetti({
        particleCount,
        startVelocity: 45,
        spread: 70,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#f59e0b', '#ef4444', '#22d3ee', '#10b981']
      });

      // Rocket from right
      confetti({
        particleCount,
        startVelocity: 45,
        spread: 70,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#34d399']
      });

      playCrackerSound();
    }, 450);
  };

  useEffect(() => {
    if (active) {
      triggerFireworkShow();
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-start justify-end p-6">
      {/* Sound Toggle Floating Control */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-[#05130b]/80 border border-amber-400/40 text-amber-300 rounded-full backdrop-blur-md shadow-2xl text-xs font-bold transition-all hover:bg-amber-400 hover:text-slate-950 cursor-pointer"
        title="Toggle Cracker Audio Sound"
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>{soundEnabled ? 'Cracker Sound ON' : 'Cracker Sound OFF'}</span>
      </button>

      {/* Canvas particle layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
