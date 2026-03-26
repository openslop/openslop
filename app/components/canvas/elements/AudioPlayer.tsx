"use client";

import { useRef, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { Waveform, type WaveformHandle } from "@/lib/components/Waveform";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  src,
  waveColor = "rgba(255, 255, 255, 0.3)",
}: {
  src: string;
  waveColor?: string;
}) {
  const waveformRef = useRef<WaveformHandle>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = useCallback(() => waveformRef.current?.toggle(), []);

  return (
    <div className="flex flex-1 min-w-0 items-center gap-2">
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        className="shrink-0 relative w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 grain grain-light flex items-center justify-center transition-colors overflow-hidden"
        onClick={toggle}
        disabled={duration === 0}
      >
        {playing ? (
          <Pause className="w-3 h-3 text-white" />
        ) : (
          <Play className="w-3 h-3 text-white ml-0.5" />
        )}
      </button>
      <Waveform
        ref={waveformRef}
        src={src}
        waveColor={waveColor}
        className="flex-1 h-10 min-w-0"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(t, d) => {
          setCurrentTime(t);
          setDuration(d);
        }}
        onFinish={() => setPlaying(false)}
      />
      <span className="shrink-0 w-16 text-right text-[10px] tabular-nums text-white/50 overflow-hidden">
        {formatTime(currentTime)}/{formatTime(duration)}
      </span>
    </div>
  );
}
