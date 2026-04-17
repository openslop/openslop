"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Waveform, type WaveformHandle } from "@/lib/components/Waveform";
import { usePreviewCache } from "../PreviewCacheContext";

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
  const peaksCache = usePreviewCache();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  return (
    <div className="flex flex-1 min-w-0 items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            className="shrink-0 relative w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 grain grain-light flex items-center justify-center transition-colors overflow-hidden"
            onClick={() => waveformRef.current?.toggle()}
            disabled={duration === 0}
          >
            {playing ? (
              <Pause className="w-3 h-3 text-white" />
            ) : (
              <Play className="w-3 h-3 text-white ml-0.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{playing ? "Pause" : "Play"}</TooltipContent>
      </Tooltip>
      <Waveform
        ref={waveformRef}
        src={src}
        peaksCache={peaksCache}
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
