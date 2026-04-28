"use client";

import { useLayout } from "./VideoLayoutContext";
import { VideoPreview } from "./VideoPreview";
import { RenderControls } from "./RenderControls";
import { QueueProgressBar } from "./QueueProgressBar";

export function VideoPanel() {
	const { layout, ready, playerKey } = useLayout();

	return (
		<div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
			<div className="grain grain-light absolute inset-0" aria-hidden="true" />
			<div className="relative z-[2]">
				{layout && ready ? (
					<VideoPreview key={playerKey} layout={layout} />
				) : layout ? (
					<QueueProgressBar />
				) : (
					<div className="flex aspect-video items-center justify-center text-sm text-white/40">
						Generate assets to see the video preview
					</div>
				)}
			</div>
			{layout && ready && (
				<div className="absolute right-3 top-3 z-10">
					<RenderControls layout={layout} />
				</div>
			)}
		</div>
	);
}
