"use client";

import { BottomTransportBar } from "./BottomTransportBar";
import { BOTTOM_VIEWS } from "./bottomViews";
import { useBottomView } from "./BottomViewContext";
import { ResizeHandle } from "./ResizeHandle";
import { useResize } from "./useResize";

const DEFAULT_HEIGHT = 260;

/** The transport bar and its panel, resized by a handle on the dock's top edge. */
export function BottomDock() {
	const { view } = useBottomView();
	const { size, handleProps, resizing } = useResize({
		axis: "vertical",
		invert: true,
		defaultSize: DEFAULT_HEIGHT,
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
