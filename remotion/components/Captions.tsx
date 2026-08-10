import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionOverlay } from "@/components/captions/CaptionOverlay";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { TextTimestamp } from "@/lib/connectors/types";
import { activeWordIndex, captionWordsAt } from "@/lib/video/captionLayout";
import { captionFontSizePx, type CaptionStyle } from "@/lib/video/captionStyle";
import { toSeconds } from "@/lib/video/frames";

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
			words: timestamps.map((ts) => ts.text),
			startTimes: timestamps.map((ts) => ts.start),
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
