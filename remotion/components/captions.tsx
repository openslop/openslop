import { use, useMemo } from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import {
	CaptionLineContext,
	type CaptionLineProps,
} from "@/components/captions/caption-line";
import { createRequiredContext } from "@/lib/components/create-required-context";
import {
	captionLines,
	wordsAt,
	type CaptionLine,
} from "@/lib/captions/caption-layout";
import {
	captionFontSizePx,
	type CaptionStyle,
} from "@/lib/captions/caption-style";
import { toFrames, toSeconds } from "@/lib/render/frames";
import type { ResolvedCaptions } from "@/lib/render/types";

// Caption styling applies to every caption in the composition, so it rides a
// provider rather than threading through the sequence layers that never read it.
const [CaptionStyleContext, useCaptionStyle] =
	createRequiredContext<CaptionStyle>("CaptionStyleContext");

export const CaptionStyleProvider = CaptionStyleContext.Provider;

type Element = CaptionLineProps["element"];

function Line({
	line,
	startFrame,
	firstWord,
	element,
	style,
}: {
	line: CaptionLine;
	startFrame: number;
	firstWord: number;
	element: Element;
	style: CaptionStyle;
}) {
	const renderLine = use(CaptionLineContext);
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	return renderLine({
		style,
		words: wordsAt(line.tokens, toSeconds(startFrame + frame, fps)),
		fontSizePx: captionFontSizePx(style.fontSize, height),
		element,
		firstWord: firstWord + line.firstWord,
	});
}

export function Captions({
	captions,
	element,
}: {
	captions: ResolvedCaptions;
	element: Element;
}) {
	const style = useCaptionStyle();
	const { fps } = useVideoConfig();
	const lines = useMemo(
		() => captionLines(captions, style.lineMs),
		[captions, style.lineMs],
	);

	return lines.flatMap((line) => {
		const from = toFrames(line.start, fps);
		const durationInFrames = toFrames(line.end, fps) - from;
		if (durationInFrames <= 0) return [];
		return (
			<Sequence
				key={`${line.firstWord}-${line.start}`}
				from={from}
				durationInFrames={durationInFrames}
			>
				<Line
					line={line}
					startFrame={from}
					firstWord={captions.firstWord}
					element={element}
					style={style}
				/>
			</Sequence>
		);
	});
}
