import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionOverlay } from "@/components/captions/caption-overlay";
import { createRequiredContext } from "@/lib/components/create-required-context";
import type { TextTimestamp } from "@/lib/connectors/types";
import { activeWordIndex, captionWordsAt } from "@/lib/captions/caption-layout";
import {
	captionFontSizePx,
	type CaptionStyle,
} from "@/lib/captions/caption-style";
import { toSeconds } from "@/lib/render/frames";

// Caption styling applies to every caption in the composition, so it rides a
// provider rather than threading through the sequence layers that never read it.
const [CaptionStyleContext, useCaptionStyle] =
	createRequiredContext<CaptionStyle>("CaptionStyleContext");

export const CaptionStyleProvider = CaptionStyleContext.Provider;

export function Captions({ timestamps }: { timestamps: TextTimestamp[] }) {
	const style = useCaptionStyle();
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();

	const { words, startTimes } = useMemo(
		() => ({
			words: timestamps.map(({ text }) => text),
			startTimes: timestamps.map(({ start }) => start),
		}),
		[timestamps],
	);

	const index = activeWordIndex(startTimes, toSeconds(frame, fps));

	return (
		<AbsoluteFill>
			<CaptionOverlay
				style={style}
				words={captionWordsAt(words, index, style)}
				fontSizePx={captionFontSizePx(style.fontSize, height)}
			/>
		</AbsoluteFill>
	);
}
