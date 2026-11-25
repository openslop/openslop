"use client";

import { Pause, Play } from "@/components/ui/icon";

export type Flash = { key: number; playing: boolean };

export function PlayPauseFlash({ flash }: { flash: Flash | null }) {
	if (!flash) return null;
	return (
		<div className="pointer-events-none absolute inset-0 grid place-items-center">
			<span
				key={flash.key}
				className="grid h-20 w-20 place-items-center rounded-full bg-on-media/55 text-on-media-foreground animate-[flashFade_500ms_ease-out_forwards]"
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
