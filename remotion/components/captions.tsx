import { use } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionLineContext } from "@/components/captions/caption-line";
import { wordsAt } from "@/lib/captions/caption-layout";
import {
	captionFontSizePx,
	type CaptionStyle,
} from "@/lib/captions/caption-style";
import { frameSpan, toSeconds } from "@/lib/render/frames";
import type { CaptionSequence } from "@/lib/render/caption-rule";

export function Captions({
	captions,
	style,
}: {
	captions: CaptionSequence[];
	style: CaptionStyle;
}) {
	const Line = use(CaptionLineContext);
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	const fontSizePx = captionFontSizePx(style.fontSize, height);
	return captions.map(({ element, line, start, duration }) => {
		const { from, durationInFrames } = frameSpan(start, duration, fps);
		if (frame < from || frame >= from + durationInFrames) return null;
		return (
			<Line
				key={`${element.id}-${start}`}
				style={style}
				words={wordsAt(
					line.tokens,
					line.startMs / 1000 + toSeconds(frame - from, fps),
				)}
				fontSizePx={fontSizePx}
				element={element}
				firstWordIndex={line.firstWordIndex}
			/>
		);
	});
}
