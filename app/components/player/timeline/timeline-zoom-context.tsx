"use client";

import type { ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/create-required-context";
import { useElementWidth } from "@/lib/components/use-element-width";
import { usePlayerControl } from "../player-control-context";
import { useLayout } from "../render-layout-context";
import { useTimelineZoom } from "./use-timeline-zoom";

/** Runway past the last tick, so its label isn't cut off by the end. */
export const RULER_TAIL_PX = 32;

function useZoomedViewport() {
	const { layout } = useLayout();
	const { player } = usePlayerControl();
	const { ref, node, width } = useElementWidth<HTMLDivElement>();
	const zoom = useTimelineZoom(
		layout.totalDurationSec,
		width - RULER_TAIL_PX,
		node,
		() => (player?.getCurrentFrame() ?? 0) / layout.fps,
	);
	return { viewportRef: ref, viewport: node, viewportWidth: width, ...zoom };
}

const [TimelineZoomContext, useTimelineZoomContext] = createRequiredContext<
	ReturnType<typeof useZoomedViewport>
>("TimelineZoomContext");
export { useTimelineZoomContext };

export function TimelineZoomProvider({ children }: { children: ReactNode }) {
	return (
		<TimelineZoomContext value={useZoomedViewport()}>
			{children}
		</TimelineZoomContext>
	);
}
