"use client";

import { ASPECT_RATIO_DIMENSIONS } from "@/lib/video/aspectRatio";
import { CAPTION_SAMPLE_WORDS } from "@/lib/video/captionPresets";
import type { CaptionStyle } from "@/lib/video/captionStyle";
import { useAspectRatio } from "@/lib/video/useAspectRatio";
import { CaptionStage, useCaptionCycle } from "./CaptionStage";

// Bounds of the panel's content column; the frame fits inside them at the
// project's aspect ratio so caption size previews at true scale.
const MAX_WIDTH = 208;
const MAX_HEIGHT = 168;

export function CaptionPreview({ style }: { style: CaptionStyle }) {
	const aspectRatio = useAspectRatio();
	const output = ASPECT_RATIO_DIMENSIONS[aspectRatio].output;
	const scale = Math.min(MAX_WIDTH / output.width, MAX_HEIGHT / output.height);
	const height = Math.round(output.height * scale);
	const activeIndex = useCaptionCycle(CAPTION_SAMPLE_WORDS.length, true);

	return (
		<div className="flex justify-center">
			<CaptionStage
				style={style}
				words={CAPTION_SAMPLE_WORDS}
				activeIndex={activeIndex}
				width={Math.round(output.width * scale)}
				height={height}
				fontSizePx={(height * style.fontSize) / 100}
			/>
		</div>
	);
}
