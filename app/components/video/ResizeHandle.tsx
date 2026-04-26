"use client";

type ResizeHandleProps = {
	axis: "vertical" | "horizontal";
	resizing: boolean;
	onMouseDown: (e: React.MouseEvent) => void;
};

export function ResizeHandle({
	axis,
	resizing,
	onMouseDown,
}: ResizeHandleProps) {
	const isVertical = axis === "vertical";

	return (
		<div
			onMouseDown={onMouseDown}
			className={`group relative flex shrink-0 items-center justify-center ${
				isVertical
					? "h-2 w-full cursor-row-resize"
					: "h-full w-4 cursor-col-resize"
			} ${resizing ? "select-none" : ""}`}
		>
			<div
				className={`absolute rounded-full transition-colors ${
					isVertical ? "h-0.5 w-full" : "h-full w-0.5"
				} ${resizing ? "bg-white/40" : "bg-white/10 group-hover:bg-white/25"}`}
				style={{
					maskImage: `linear-gradient(${
						isVertical ? "to right" : "to bottom"
					}, transparent, black 20%, black 80%, transparent)`,
				}}
			/>
			<div
				className={`relative rounded-full transition-colors ${
					isVertical ? "h-1 w-6" : "h-6 w-1"
				} ${resizing ? "bg-white/50" : "bg-white/30 group-hover:bg-white/50"}`}
			/>
		</div>
	);
}
