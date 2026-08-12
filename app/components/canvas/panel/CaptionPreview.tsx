"use client";

import { useCallback, useState } from "react";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/video/aspectRatio";
import { CAPTION_SAMPLE_WORDS } from "@/lib/video/captionPresets";
import { captionFontSizePx, type CaptionStyle } from "@/lib/video/captionStyle";
import { useVideoSetting } from "@/lib/video/useVideoSetting";
import { CaptionStage, useCaptionCycle } from "./CaptionStage";

const MAX_HEIGHT = 168;

function useMeasuredWidth(): [(node: HTMLDivElement | null) => void, number] {
	const [width, setWidth] = useState(0);
	const ref = useCallback((node: HTMLDivElement | null) => {
		if (!node) return;
		const observer = new ResizeObserver(([entry]) =>
			setWidth(entry.contentRect.width),
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);
	return [ref, width];
}

/**
 * The caption at true scale inside a frame of the project's aspect ratio. It
 * plays on hover like the preset thumbnails, so an idle panel holds still.
 */
export function CaptionPreview({ style }: { style: CaptionStyle }) {
	const aspectRatio = useVideoSetting("aspectRatio");
	const [ref, available] = useMeasuredWidth();
	const [playing, setPlaying] = useState(false);
	const output = ASPECT_RATIO_DIMENSIONS[aspectRatio].output;
	const scale = Math.min(available / output.width, MAX_HEIGHT / output.height);
	const height = Math.round(output.height * scale);
	const activeIndex = useCaptionCycle(CAPTION_SAMPLE_WORDS.length, playing);

	return (
		<div
			ref={ref}
			onPointerEnter={() => setPlaying(true)}
			onPointerLeave={() => setPlaying(false)}
			className="flex justify-center"
		>
			<CaptionStage
				style={style}
				words={CAPTION_SAMPLE_WORDS}
				activeIndex={activeIndex}
				width={Math.round(output.width * scale)}
				height={height}
				fontSizePx={captionFontSizePx(style.fontSize, height)}
			/>
		</div>
	);
}
