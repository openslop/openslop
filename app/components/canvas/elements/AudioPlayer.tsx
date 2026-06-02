"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Waveform, type WaveformHandle } from "@/lib/components/Waveform";
import { formatTime } from "@/lib/video/timestamps";
import { usePreviewCache } from "../PreviewCacheContext";

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
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						aria-label={playing ? "Pause" : "Play"}
						onClick={() => waveformRef.current?.toggle()}
						disabled={duration === 0}
						className="shrink-0 relative w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 grain grain-light flex items-center justify-center transition-colors overflow-hidden disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10"
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
				className="flex-1 basis-[160px] min-w-0 h-10"
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onTimeUpdate={(t, d) => {
					setCurrentTime(t);
					setDuration(d);
				}}
				onFinish={() => setPlaying(false)}
			/>
			<span className="shrink-0 ml-auto text-[10px] tabular-nums text-white/50">
				{formatTime(currentTime)}/{formatTime(duration)}
			</span>
		</>
	);
}
