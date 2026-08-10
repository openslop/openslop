import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionOverlay } from "@/components/captions/CaptionOverlay";
import type { TextTimestamp } from "@/lib/connectors/types";
import { activeWordIndex, captionWordsAt } from "@/lib/video/captionLayout";
import { captionFontSizePx, type CaptionStyle } from "@/lib/video/captionStyle";
import { toSeconds } from "@/lib/video/frames";

export function Captions({
	timestamps,
	style,
}: {
	timestamps: TextTimestamp[];
	style: CaptionStyle;
}) {
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
