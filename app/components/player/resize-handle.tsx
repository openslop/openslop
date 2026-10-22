"use client";

import type { ResizeAxis, useResize } from "./use-resize";

const fade = (direction: "to right" | "to bottom") =>
	`linear-gradient(${direction}, transparent, black 20%, black 80%, transparent)`;

// A "vertical" axis resizes top/bottom panels, so the handle itself is a
// horizontal line (shadow on its bottom); "horizontal" is a vertical line
// (shadow on its right).
const LINES: Record<
	ResizeAxis,
	{
		orientation: "horizontal" | "vertical";
		handle: string;
		line: string;
		bar: string;
		mask: string;
	}
> = {
	vertical: {
		orientation: "horizontal",
		handle: "h-2 w-full cursor-row-resize",
		line: "h-0.5 w-full flex-col",
		bar: "h-px w-full",
		mask: fade("to right"),
	},
	horizontal: {
		orientation: "vertical",
		handle: "h-full w-4 cursor-col-resize",
		line: "h-full w-0.5",
		bar: "h-full w-px",
		mask: fade("to bottom"),
	},
};

type ResizeHandleProps = {
	axis: ResizeAxis;
	label: string;
	resizing: boolean;
	handleProps: ReturnType<typeof useResize>["handleProps"];
};

export function ResizeHandle({
	axis,
	label,
	resizing,
	handleProps,
}: ResizeHandleProps) {
	const { orientation, handle, line, bar, mask } = LINES[axis];

	return (
		<div
			{...handleProps}
			role="separator"
			aria-orientation={orientation}
			aria-label={label}
			tabIndex={0}
			className={`group relative flex shrink-0 touch-none items-center justify-center focus-ring ${handle} ${resizing ? "select-none" : ""}`}
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
