"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  type Ref,
  type MouseEvent,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface WaveformProps {
  src: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  waveColor?: string;
  progressColor?: string;
  className?: string;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number, duration: number) => void;
  onFinish?: () => void;
}

export interface WaveformHandle {
  play(): void;
  pause(): void;
  toggle(): void;
  seek(progress: number): void;
}

const PEAK_COUNT = 200;

/** Extract normalized peak amplitudes (0–1) from raw audio samples. */
export function extractPeaks(data: Float32Array, count: number): number[] {
  const step = Math.floor(data.length / count);
  if (step === 0) return [];
  const peaks: number[] = [];
  let max = 0;
  for (let i = 0; i < count; i++) {
    let peak = 0;
    const offset = i * step;
    for (let j = 0; j < step; j++) {
      const v = Math.abs(data[offset + j]);
      if (v > peak) peak = v;
    }
    peaks.push(peak);
    if (peak > max) max = peak;
  }
  return max > 0 ? peaks.map((p) => p / max) : peaks;
}

export interface BarStyle {
  barWidth: number;
  barGap: number;
  barRadius: number;
  waveColor: string;
  progressColor: string;
}

/** Draw rounded-bar waveform with progress coloring onto a canvas. */
export function drawBars(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  peaks: number[],
  progress: number,
  style: BarStyle,
) {
  ctx.clearRect(0, 0, cssW, cssH);
  if (peaks.length === 0 || cssW === 0) return;
  const { barWidth, barGap, barRadius, waveColor, progressColor } = style;
  const total = barWidth + barGap;
  const n = Math.floor(cssW / total);
  if (n === 0) return;

  const renderBars = (color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = i * total;
      const peak = peaks[Math.floor((i * peaks.length) / n)];
      const bh = Math.max(2, peak * (cssH - 2));
      const y = (cssH - bh) / 2;
      ctx.roundRect(
        x,
        y,
        barWidth,
        bh,
        Math.min(barRadius, barWidth / 2, bh / 2),
      );
    }
    ctx.fill();
  };

  renderBars(waveColor);

  const px = progress * cssW;
  if (px > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, px, cssH);
    ctx.clip();
    renderBars(progressColor);
    ctx.restore();
  }
}

export function Waveform({
  src,
  barWidth = 3,
  barGap = 3,
  barRadius = 4,
  waveColor = "rgba(255, 255, 255, 0.3)",
  progressColor = "rgba(255, 255, 255, 0.85)",
  className,
  ref,
  onReady,
  onPlay,
  onPause,
  onTimeUpdate,
  onFinish,
}: WaveformProps & { ref?: Ref<WaveformHandle> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const peaksRef = useRef<number[]>([]);
  const drawRef = useRef(() => {});
  const [loading, setLoading] = useState(true);

  // Keep draw function always-current without effect deps
  drawRef.current = () => {
    const c = canvasRef.current;
    const a = audioRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const { width: cssW, height: cssH } = c.getBoundingClientRect();
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const p = a && a.duration ? a.currentTime / a.duration : 0;
    drawBars(ctx, cssW, cssH, peaksRef.current, p, {
      barWidth,
      barGap,
      barRadius,
      waveColor,
      progressColor,
    });
  };

  useEffect(() => {
    peaksRef.current = [];
    setLoading(true);

    let cancelled = false;
    const ac = new AudioContext();
    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => ac.decodeAudioData(buf))
      .then((ab) => {
        if (cancelled) return;
        peaksRef.current = extractPeaks(ab.getChannelData(0), PEAK_COUNT);
        setLoading(false);
        onReady?.();
      })
      .catch((e) => {
        console.error("Failed to decode audio:", e);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      ac.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onReady read via drawRef pattern, not a direct dep
  }, [src]);

  useEffect(() => {
    if (!loading) drawRef.current();
  }, [loading]);

  useEffect(() => {
    drawRef.current();
  }, [barWidth, barGap, barRadius, waveColor, progressColor]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      play() {
        audioRef.current?.play();
      },
      pause() {
        audioRef.current?.pause();
      },
      toggle() {
        const a = audioRef.current;
        if (a) {
          if (a.paused) a.play();
          else a.pause();
        }
      },
      seek(progress: number) {
        const a = audioRef.current;
        if (a?.duration) {
          a.currentTime = Math.max(0, Math.min(1, progress)) * a.duration;
          drawRef.current();
        }
      },
    }),
    [],
  );

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const a = audioRef.current;
    if (!a?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
    drawRef.current();
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="block size-full cursor-pointer"
        />
        {loading && (
          <Skeleton className="absolute inset-0 animate-none shimmer-surface" />
        )}
      </div>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        hidden
        onTimeUpdate={() => {
          drawRef.current();
          const a = audioRef.current;
          if (a) onTimeUpdate?.(a.currentTime, a.duration || 0);
        }}
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a) onTimeUpdate?.(0, a.duration || 0);
        }}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onFinish}
      />
    </>
  );
}
