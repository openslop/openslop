"use client";

import { Pause, Play } from "lucide-react";

export function PlayPauseFlash({
	flash,
}: {
	flash: { key: number; playing: boolean } | null;
}) {
	if (!flash) return null;
	return (
		<div className="pointer-events-none absolute inset-0 grid place-items-center">
			<span
				key={flash.key}
				className="grid h-20 w-20 place-items-center rounded-full bg-black/55 text-white animate-[flashFade_500ms_ease-out_forwards]"
			>
				{flash.playing ? (
					<Play className="h-7 w-7 fill-current" />
				) : (
					<Pause className="h-7 w-7 fill-current" />
				)}
			</span>
		</div>
	);
}
