"use client";

import { BottomTransportBar } from "./bottom-transport-bar";
import { DOCK_DEFAULT_HEIGHT } from "./dock-layout";
import { BOTTOM_VIEWS } from "./bottom-views";
import { useBottomView } from "./bottom-view-context";
import { TimelineZoomProvider } from "./timeline/timeline-zoom-context";
import { ResizeHandle } from "@/app/components/resize/resize-handle";
import { useResize } from "@/app/components/resize/use-resize";

/** The zoom sits above the resize state, so a dock drag never re-renders the timeline. */
export function BottomDock() {
	return (
		<TimelineZoomProvider>
			<ResizableDock />
		</TimelineZoomProvider>
	);
}

function ResizableDock() {
	const { view } = useBottomView();
	const { size, handleProps, resizing } = useResize({
		axis: "vertical",
		handleEdge: "start",
		defaultSize: DOCK_DEFAULT_HEIGHT,
		minSize: 160,
		maxViewportFraction: 0.75,
	});

	const { fillsDock, panel } = BOTTOM_VIEWS[view];

	return (
		<div
			className="flex shrink-0 flex-col max-sm:max-h-1/4"
			style={fillsDock ? { height: size } : undefined}
		>
			{fillsDock ? (
				<ResizeHandle
					axis="vertical"
					label="Resize bottom panel"
					resizing={resizing}
					handleProps={handleProps}
				/>
			) : null}
			<BottomTransportBar />
			{fillsDock ? (
				<div className="min-h-0 flex-1 overflow-hidden">{panel}</div>
			) : (
				panel
			)}
		</div>
	);
}
