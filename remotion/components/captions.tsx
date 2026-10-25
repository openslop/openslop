import { Fragment, use } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionLineContext } from "@/components/captions/caption-line";
import { wordsAt } from "@/lib/captions/caption-layout";
import {
	captionFontSizePx,
	type CaptionStyle,
} from "@/lib/captions/caption-style";
import { frameSpan, toSeconds } from "@/lib/render/frames";
import type { CaptionSequence } from "@/lib/render/caption-rule";

/** Draws only the lines on screen at this frame, so a long video's other lines cost nothing. */
export function Captions({
	captions,
	style,
}: {
	captions: CaptionSequence[];
	style: CaptionStyle;
}) {
	const renderLine = use(CaptionLineContext);
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	const fontSizePx = captionFontSizePx(style.fontSize, height);
	return captions.map(({ element, line, start, duration }) => {
		const { from, durationInFrames } = frameSpan(start, duration, fps);
		if (frame < from || frame >= from + durationInFrames) return null;
		return (
			<Fragment key={`${element.id}-${start}`}>
				{renderLine({
					style,
					words: wordsAt(
						line.tokens,
						line.start + toSeconds(frame - from, fps),
					),
					fontSizePx,
					element,
					firstWord: line.firstWord,
				})}
			</Fragment>
		);
	});
}
