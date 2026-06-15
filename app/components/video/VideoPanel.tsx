"use client";

import { useScriptControl } from "@/lib/script/ScriptProvider";
import { useLayout } from "./VideoLayoutContext";
import { VideoPreview } from "./VideoPreview";
import { RenderControls } from "./RenderControls";
import { QueueProgressBar } from "./QueueProgressBar";
import { PlayerShimmer } from "./PlayerShimmer";

function VideoPanelBody() {
	const { layout, ready, playerKey } = useLayout();
	const { loading: scriptLoading } = useScriptControl();

	if (scriptLoading) {
		return (
			<PlayerShimmer>
				<div className="text-xs text-muted-foreground">Writing script…</div>
			</PlayerShimmer>
		);
	}
	if (!layout?.series.length) {
		return (
			<div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
				Generate elements to playback
			</div>
		);
	}
	if (!ready) return <QueueProgressBar />;
	return <VideoPreview key={playerKey} layout={layout} />;
}

export function VideoPanel() {
	const { layout, ready } = useLayout();
	const { loading: scriptLoading } = useScriptControl();
	const showControls = !scriptLoading && !!layout?.series.length && ready;

	return (
		<div className="group relative h-full w-full overflow-hidden rounded-lg border border-border bg-card">
			<div className=" absolute inset-0" aria-hidden="true" />
			<div className="relative z-[2] h-full w-full">
				<VideoPanelBody />
			</div>
			{showControls && (
				<div className="absolute right-3 top-3 z-10">
					<RenderControls layout={layout} />
				</div>
			)}
		</div>
	);
}
