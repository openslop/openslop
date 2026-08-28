"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Waveform, type WaveformHandle } from "@/lib/components/Waveform";
import { formatTime } from "@/lib/video/timestamps";

export function AudioPlayer({ src }: { src: string }) {
	const waveformRef = useRef<WaveformHandle>(null);
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	return (
		<>
			<TooltipIconButton
				label={playing ? "Pause" : "Play"}
				onClick={() => waveformRef.current?.toggle()}
				disabled={duration === 0}
			>
				{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
			</TooltipIconButton>
			<Waveform
				ref={waveformRef}
				src={src}
				className="flex-1 basis-[160px] min-w-0 h-10"
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onTimeUpdate={(t, d) => {
					setCurrentTime(t);
					setDuration(d);
				}}
				onFinish={() => setPlaying(false)}
			/>
			<span className="shrink-0 ml-auto text-badge font-numeric text-muted-foreground">
				{formatTime(currentTime)}/{formatTime(duration)}
			</span>
		</>
	);
}
