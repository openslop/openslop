import { use, useMemo } from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import {
	CaptionLineContext,
	type CaptionLineProps,
} from "@/components/captions/caption-line";
import { createRequiredContext } from "@/lib/components/create-required-context";
import {
	activeWordIndex,
	captionLines,
	wordsOnLine,
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

type Words = { text: string[]; startTimes: number[] };

type Element = CaptionLineProps["element"];

function Line({
	line,
	startFrame,
	words,
	firstWord,
	element,
	style,
}: {
	line: CaptionLine;
	startFrame: number;
	words: Words;
	firstWord: number;
	element: Element;
	style: CaptionStyle;
}) {
	const renderLine = use(CaptionLineContext);
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();
	const index = activeWordIndex(
		words.startTimes,
		toSeconds(startFrame + frame, fps),
	);
	return renderLine({
		style,
		words: wordsOnLine(words.text, index, line),
		fontSizePx: captionFontSizePx(style.fontSize, height),
		element,
		from: firstWord + line.from,
		to: firstWord + line.to,
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
	const words = useMemo(
		() => ({
			text: captions.words.map(({ text }) => text),
			startTimes: captions.words.map(({ start }) => start),
		}),
		[captions.words],
	);

	return lines.flatMap((line) => {
		const from = toFrames(line.start, fps);
		const durationInFrames = toFrames(line.end, fps) - from;
		if (durationInFrames <= 0) return [];
		return (
			<Sequence
				key={`${line.from}-${line.start}`}
				from={from}
				durationInFrames={durationInFrames}
			>
				<Line
					line={line}
					startFrame={from}
					words={words}
					firstWord={captions.firstWord}
					element={element}
					style={style}
				/>
			</Sequence>
		);
	});
}
