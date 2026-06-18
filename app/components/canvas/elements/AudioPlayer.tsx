"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Waveform, type WaveformHandle } from "@/lib/components/Waveform";
import { formatTime } from "@/lib/video/timestamps";
import { usePreviewCache } from "../PreviewCacheContext";

export function AudioPlayer({ src }: { src: string }) {
	const waveformRef = useRef<WaveformHandle>(null);
	const peaksCache = usePreviewCache();
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<IconButton
						ariaLabel={playing ? "Pause" : "Play"}
						onClick={() => waveformRef.current?.toggle()}
						disabled={duration === 0}
					>
						{playing ? (
							<Pause className="h-4 w-4" />
						) : (
							<Play className="h-4 w-4" />
						)}
					</IconButton>
				</TooltipTrigger>
				<TooltipContent>{playing ? "Pause" : "Play"}</TooltipContent>
			</Tooltip>
			<Waveform
				ref={waveformRef}
				src={src}
				peaksCache={peaksCache}
				className="flex-1 basis-[160px] min-w-0 h-10"
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onTimeUpdate={(t, d) => {
					setCurrentTime(t);
					setDuration(d);
				}}
				onFinish={() => setPlaying(false)}
			/>
			<span className="shrink-0 ml-auto text-[10px] tabular-nums text-muted-foreground">
				{formatTime(currentTime)}/{formatTime(duration)}
			</span>
		</>
	);
}
