import {
	captionSourceOf,
	isCaptionable,
	type ContentType,
} from "@/lib/canvas/types";
import { captionLines, type CaptionLine } from "@/lib/captions/caption-layout";
import { frameSpan } from "./frames";
import { layoutSequences, secUntilNextScene } from "./sequences";
import type { RenderLayout, Sequence } from "./types";

type Layout = Pick<RenderLayout, "series" | "sequences">;

export type CaptionSequence = Sequence & {
	/** Timed from the element's start, as its words are. */
	line: CaptionLine;
};

/** A video gives way to speech: its scene's voices are captioned instead. */
export const yieldsToSpeech = (type: ContentType, sceneSpeaks: boolean) =>
	sceneSpeaks && captionSourceOf(type) === "video";

export const isSpeech = (type: ContentType) =>
	captionSourceOf(type) === "speech";

/** The sequences that show captions once every speech has words, so a muted video never needs any. */
export function captionableSequences(layout: Layout): Sequence[] {
	const sequences = layoutSequences(layout);
	const spokenScenes = new Set(
		sequences
			.filter(({ element }) => isSpeech(element.type))
			.map(({ element }) => element.sceneId),
	);
	return sequences.filter(
		({ element }) =>
			isCaptionable(element.type) &&
			!yieldsToSpeech(element.type, spokenScenes.has(element.sceneId)),
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

/** Every caption line on the video's time, each stopping by where the next scene begins. */
export function layoutCaptions(
	layout: Pick<RenderLayout, "series" | "sequences" | "captionStyle" | "fps">,
): CaptionSequence[] {
	return layoutSequences(layout)
		.flatMap((sequence) =>
			linesOf(sequence, layout.series, layout.captionStyle.lineMs),
		)
		.filter(
			({ start, duration }) =>
				frameSpan(start, duration, layout.fps).durationInFrames > 0,
		)
		.sort((a, b) => a.start - b.start);
}
