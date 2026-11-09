"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Waveform, type WaveformHandle } from "@/lib/components/waveform";
import { formatTime } from "@/lib/render/timestamps";

const TONES = {
	default: { button: "default", time: "text-muted-foreground" },
	/** In the side panel, in its heading's color. */
	panel: { button: "panel", time: "text-panel-label" },
} as const;

/** `volume` is the playback gain, 0 to 1. */
export function AudioPlayer({
	src,
	volume,
	tone = "default",
}: {
	src: string;
	volume?: number;
	tone?: keyof typeof TONES;
}) {
	const waveformRef = useRef<WaveformHandle>(null);
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	return (
		<>
			<TooltipIconButton
				label={playing ? "Pause" : "Play"}
				variant={TONES[tone].button}
				onClick={() => waveformRef.current?.toggle()}
				disabled={duration === 0}
			>
				{playing ? <Pause /> : <Play />}
			</TooltipIconButton>
			<Waveform
				ref={waveformRef}
				src={src}
				volume={volume}
				className="flex-1 basis-[160px] min-w-0 h-10"
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onTimeUpdate={(time, duration) => {
					setCurrentTime(time);
					setDuration(duration);
				}}
				onFinish={() => setPlaying(false)}
			/>
			<span
				className={`shrink-0 ml-auto text-badge font-numeric ${TONES[tone].time}`}
			>
				{formatTime(currentTime)}/{formatTime(duration)}
			</span>
		</>
	);
}
