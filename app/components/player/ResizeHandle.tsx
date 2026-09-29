"use client";

import type { PointerDragProps } from "@/lib/components/usePointerDrag";

type ResizeAxis = "vertical" | "horizontal";

const fade = (direction: "to right" | "to bottom") =>
	`linear-gradient(${direction}, transparent, black 20%, black 80%, transparent)`;

// A "vertical" axis resizes top/bottom panels, so the handle itself is a
// horizontal line (shadow on its bottom); "horizontal" is a vertical line
// (shadow on its right).
const LINES: Record<
	ResizeAxis,
	{ handle: string; line: string; bar: string; mask: string }
> = {
	vertical: {
		handle: "h-2 w-full cursor-row-resize",
		line: "h-0.5 w-full flex-col",
		bar: "h-px w-full",
		mask: fade("to right"),
	},
	horizontal: {
		handle: "h-full w-4 cursor-col-resize",
		line: "h-full w-0.5",
		bar: "h-full w-px",
		mask: fade("to bottom"),
	},
};

type ResizeHandleProps = {
	axis: ResizeAxis;
	resizing: boolean;
	handleProps: PointerDragProps;
};

export function ResizeHandle({
	axis,
	resizing,
	handleProps,
}: ResizeHandleProps) {
	const { handle, line, bar, mask } = LINES[axis];

	return (
		<div
			{...handleProps}
			className={`group relative flex shrink-0 touch-none items-center justify-center ${handle} ${resizing ? "select-none" : ""}`}
		>
			<div
				className={`flex ${line}`}
				style={{ maskImage: mask, WebkitMaskImage: mask }}
			>
				<div
					className={`bg-resizer transition-colors group-hover:bg-resizer-hover ${bar}`}
				/>
				<div className={`bg-resizer-shadow ${bar}`} />
			</div>
		</div>
	);
}
