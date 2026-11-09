"use client";

import { cn } from "@/lib/utils";
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
		/** Cancels the handle's own thickness so a quiet one takes no room. */
		overlap: string;
		line: string;
		bar: string;
		mask: string;
	}
> = {
	vertical: {
		orientation: "horizontal",
		handle: "h-2 w-full cursor-row-resize",
		overlap: "-my-1",
		line: "h-0.5 w-full flex-col",
		bar: "h-px w-full",
		mask: fade("to right"),
	},
	horizontal: {
		orientation: "vertical",
		handle: "h-full w-4 cursor-col-resize",
		overlap: "-mx-2",
		line: "h-full w-0.5",
		bar: "h-full w-px",
		mask: fade("to bottom"),
	},
};

type ResizeHandleProps = {
	axis: ResizeAxis;
	label: string;
	/** `quiet` takes no room and shows its line only while hovered, focused or dragged. */
	look?: "default" | "quiet";
	resizing: boolean;
	handleProps: ReturnType<typeof useResize>["handleProps"];
};

export function ResizeHandle({
	axis,
	label,
	look = "default",
	resizing,
	handleProps,
}: ResizeHandleProps) {
	const { orientation, handle, overlap, line, bar, mask } = LINES[axis];

	return (
		<div
			{...handleProps}
			role="separator"
			aria-orientation={orientation}
			aria-label={label}
			tabIndex={0}
			className={cn(
				"group relative flex shrink-0 touch-none items-center justify-center focus-ring",
				handle,
				look === "quiet" && ["z-10", overlap],
				resizing && "select-none",
			)}
		>
			<div
				className={cn(
					"flex transition-opacity",
					line,
					look === "quiet" &&
						!resizing &&
						"opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
				)}
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
