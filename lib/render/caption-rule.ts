import { captionSourceOf, isCaptionable } from "@/lib/canvas/types";
import { captionLines, type CaptionLine } from "@/lib/captions/caption-layout";
import { frameSpan } from "./frames";
import { layoutSequences, secUntilNextScene } from "./sequences";
import type { RenderLayout, Sequence } from "./types";

type Layout = Pick<RenderLayout, "series" | "sequences">;

export type CaptionSequence = Sequence & {
	/** Timed from the element's start, as its words are. */
	line: CaptionLine;
};

const isSpeech = ({ element }: Sequence) =>
	captionSourceOf(element.type) === "speech";

const scenesOf = (sequences: Sequence[]) =>
	new Set(sequences.map(({ element }) => element.sceneId));

/** A video gives way to speech: its scene's voices are captioned instead. */
const yieldsToSpeech = ({ element }: Sequence, spokenScenes: Set<string>) =>
	captionSourceOf(element.type) === "video" &&
	spokenScenes.has(element.sceneId);

/** The sequences that show captions once every speech has words, so a muted video never needs any. */
export function captionableSequences(layout: Layout): Sequence[] {
	const sequences = layoutSequences(layout);
	const spokenScenes = scenesOf(sequences.filter(isSpeech));
	return sequences.filter(
		(sequence) =>
			isCaptionable(sequence.element.type) &&
			!yieldsToSpeech(sequence, spokenScenes),
	);
}

function linesOf(
	sequence: Sequence,
	series: Sequence[],
	lineMs: number,
): CaptionSequence[] {
	const { element, start } = sequence;
	if (!element.captions) return [];
	const untilSec = Math.min(
		element.captions.untilSec,
		secUntilNextScene(sequence, series),
	);
	return captionLines({ ...element.captions, untilSec }, lineMs).map(
		(line) => ({
			element,
			line,
			start: start + line.start,
			duration: line.end - line.start,
		}),
	);
}

/** Every caption line on the video's time; a video yields to captioned speech in its scene, and each stops by where the next scene begins. */
export function layoutCaptions(
	layout: Pick<RenderLayout, "series" | "sequences" | "captionStyle" | "fps">,
): CaptionSequence[] {
	const sequences = layoutSequences(layout);
	const spokenScenes = scenesOf(
		sequences.filter(
			(sequence) => sequence.element.captions && isSpeech(sequence),
		),
	);
	return sequences
		.filter((sequence) => !yieldsToSpeech(sequence, spokenScenes))
		.flatMap((sequence) =>
			linesOf(sequence, layout.series, layout.captionStyle.lineMs),
		)
		.filter(
			({ start, duration }) =>
				frameSpan(start, duration, layout.fps).durationInFrames > 0,
		)
		.sort((a, b) => a.start - b.start);
}
