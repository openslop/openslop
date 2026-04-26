"use client";

import { ResizeHandle } from "./ResizeHandle";
import { useResize } from "./useResize";
import { VideoPanel } from "./VideoPanel";

const TOP_DEFAULT = 300;
const SIDE_DEFAULT = 800;
const HANDLE_PX = 16;

export function TopPlayerPanel() {
	const maxSize =
		typeof window !== "undefined" ? window.innerHeight * 0.6 : 500;

	const { size, handleMouseDown, resizing } = useResize({
		axis: "vertical",
		defaultSize: TOP_DEFAULT,
		minSize: 150,
		maxSize,
	});

	const videoMaxWidth = (size - HANDLE_PX) * (16 / 9);

	return (
		<div className="shrink-0" style={{ height: size }}>
			<div
				className="relative mx-auto h-[calc(100%-0.5rem)] max-w-6xl p-2"
				style={{ maxWidth: videoMaxWidth }}
			>
				<VideoPanel />
			</div>
			<ResizeHandle
				axis="vertical"
				resizing={resizing}
				onMouseDown={handleMouseDown}
			/>
		</div>
	);
}

export function SidePlayerPanel() {
	const maxSize = typeof window !== "undefined" ? window.innerWidth * 0.5 : 600;

	const { size, handleMouseDown, resizing } = useResize({
		axis: "horizontal",
		defaultSize: SIDE_DEFAULT,
		minSize: 250,
		maxSize,
	});

	return (
		<div className="flex shrink-0" style={{ width: size }}>
			<ResizeHandle
				axis="horizontal"
				resizing={resizing}
				onMouseDown={handleMouseDown}
			/>
			<div className="flex flex-1 flex-col justify-center overflow-hidden p-4">
				<VideoPanel />
			</div>
		</div>
	);
}
