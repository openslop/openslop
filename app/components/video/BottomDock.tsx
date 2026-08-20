"use client";

import type { ReactNode } from "react";
import { BottomTransportBar } from "./BottomTransportBar";
import { useBottomView, type BottomView } from "./BottomViewContext";
import { ResizeHandle } from "./ResizeHandle";
import { useResize } from "./useResize";

const DEFAULT_HEIGHT = 260;

/** Views that fill the dock; the rest sit at their own height. */
const FILLS_DOCK: Record<BottomView, boolean> = {
	timeline: true,
	storyboard: false,
	hidden: false,
};

/** The transport bar and its panel, resized by a handle on the dock's top edge. */
export function BottomDock({ children }: { children: ReactNode }) {
	const { view } = useBottomView();
	const { size, handleMouseDown, resizing } = useResize({
		axis: "vertical",
		invert: true,
		defaultSize: DEFAULT_HEIGHT,
		minSize: 160,
		maxViewportFraction: 0.75,
	});

	const fills = FILLS_DOCK[view];

	return (
		<div
			className="flex shrink-0 flex-col"
			style={fills ? { height: size } : undefined}
		>
			{fills ? (
				<ResizeHandle
					axis="vertical"
					resizing={resizing}
					onMouseDown={handleMouseDown}
				/>
			) : null}
			<BottomTransportBar />
			{fills ? (
				<div className="min-h-0 flex-1 overflow-hidden">{children}</div>
			) : (
				children
			)}
		</div>
	);
}
