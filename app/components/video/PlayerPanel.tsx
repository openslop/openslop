"use client";

import type { ReactNode } from "react";
import { getAspectRatioValue } from "@/lib/video/aspectRatio";
import { useAspectRatio } from "@/lib/video/useAspectRatio";
import { ResizeHandle } from "./ResizeHandle";
import { useResize } from "./useResize";
import { VideoPanel } from "./VideoPanel";

const TOP_DEFAULT = 300;
const SIDE_DEFAULT = 560;

function FitToAspectRatio({
	ratio,
	children,
}: {
	ratio: number;
	children: ReactNode;
}) {
	return (
		<div
			className="flex h-full w-full items-center justify-center"
			style={{ containerType: "size" }}
		>
			<div
				style={{
					width: `min(100cqw, calc(100cqh * ${ratio}))`,
					height: `min(100cqh, calc(100cqw / ${ratio}))`,
				}}
			>
				{children}
			</div>
		</div>
	);
}

export function TopPlayerPanel() {
	const maxSize =
		typeof window !== "undefined" ? window.innerHeight * 0.6 : 500;
	const aspectRatio = useAspectRatio();

	const { size, handleMouseDown, resizing } = useResize({
		axis: "vertical",
		defaultSize: TOP_DEFAULT,
		minSize: 150,
		maxSize,
	});

	return (
		<div className="shrink-0" style={{ height: size }}>
			<div className="relative mx-auto h-[calc(100%-0.5rem)] max-w-6xl p-2">
				<FitToAspectRatio ratio={getAspectRatioValue(aspectRatio)}>
					<VideoPanel />
				</FitToAspectRatio>
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
	const aspectRatio = useAspectRatio();

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
				<FitToAspectRatio ratio={getAspectRatioValue(aspectRatio)}>
					<VideoPanel />
				</FitToAspectRatio>
			</div>
		</div>
	);
}
