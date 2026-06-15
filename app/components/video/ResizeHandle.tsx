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
	// A "vertical" axis resizes top/bottom panels, so the handle itself is a
	// horizontal line (shadow on its bottom); "horizontal" is a vertical line
	// (shadow on its right).
	const isHorizontalLine = axis === "vertical";

	return (
		<div
			onMouseDown={onMouseDown}
			className={`group relative flex shrink-0 items-center justify-center ${
				isHorizontalLine
					? "h-2 w-full cursor-row-resize"
					: "h-full w-4 cursor-col-resize"
			} ${resizing ? "select-none" : ""}`}
		>
			<div
				className={`flex ${isHorizontalLine ? "h-0.5 w-full flex-col" : "h-full w-0.5"}`}
				style={{
					maskImage: `linear-gradient(${
						isHorizontalLine ? "to right" : "to bottom"
					}, transparent, black 20%, black 80%, transparent)`,
					WebkitMaskImage: `linear-gradient(${
						isHorizontalLine ? "to right" : "to bottom"
					}, transparent, black 20%, black 80%, transparent)`,
				}}
			>
				<div
					className={`bg-resizer transition-colors group-hover:bg-resizer-hover ${
						isHorizontalLine ? "h-px w-full" : "h-full w-px"
					}`}
				/>
				<div
					className={`bg-resizer-shadow ${
						isHorizontalLine ? "h-px w-full" : "h-full w-px"
					}`}
				/>
			</div>
		</div>
	);
}
