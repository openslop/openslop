"use client";

import { BottomTransportBar } from "./bottom-transport-bar";
import { DOCK_DEFAULT_HEIGHT } from "./dock-layout";
import { BOTTOM_VIEWS } from "./bottom-views";
import { useBottomView } from "./bottom-view-context";
import { ResizeHandle } from "./resize-handle";
import { useResize } from "./use-resize";

/** The transport bar and its panel, resized by a handle on the dock's top edge. */
export function BottomDock() {
	const { view } = useBottomView();
	const { size, handleProps, resizing } = useResize({
		axis: "vertical",
		invert: true,
		defaultSize: DOCK_DEFAULT_HEIGHT,
		minSize: 160,
		maxViewportFraction: 0.75,
	});

	const { fillsDock, panel } = BOTTOM_VIEWS[view];

	return (
		<div
			className="flex shrink-0 flex-col"
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
