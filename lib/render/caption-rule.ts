import { captionSourceOf, isCaptionable } from "@/lib/canvas/types";
import {
	groupIntoLines,
	lineSpanSec,
	type CaptionLine,
} from "@/lib/captions/caption-layout";
import { frameSpan } from "./frames";
import { allSequences, secUntilNextScene } from "./sequences";
import type { RenderLayout, Sequence } from "./types";

type Layout = Pick<RenderLayout, "series" | "sequences">;

export type CaptionSequence = Sequence & {
	/** Timed from the element's start, as its words are. */
	line: CaptionLine;
};

const isSpeech = ({ element }: Sequence) =>
	captionSourceOf(element.type) === "speech";

const sceneIdsOf = (sequences: Sequence[]) =>
	new Set(sequences.map(({ element }) => element.sceneId));

const isVideoInSpokenScene = (
	{ element }: Sequence,
	spokenScenes: Set<string>,
) =>
	captionSourceOf(element.type) === "video" &&
	spokenScenes.has(element.sceneId);

export function captionableSequences(layout: Layout): Sequence[] {
	const sequences = allSequences(layout);
	const scenesWithSpeech = sceneIdsOf(sequences.filter(isSpeech));
	return sequences.filter(
		(sequence) =>
			isCaptionable(sequence.element.type) &&
			!isVideoInSpokenScene(sequence, scenesWithSpeech),
	);
}

const coversAFrame = (start: number, duration: number, fps: number) =>
	frameSpan(start, duration, fps).durationInFrames > 0;

function linesUntilNextScene(
	sequence: Sequence,
	series: Sequence[],
	lineMs: number,
): CaptionSequence[] {
	const { element, start } = sequence;
	if (!element.captions) return [];
	const untilSec = Math.min(
		element.durationSec,
		secUntilNextScene(sequence, series),
	);
	const { firstWordIndex, words } = element.captions;
	return groupIntoLines(words, lineMs, firstWordIndex)
		.map((line) => {
			const { fromSec, toSec } = lineSpanSec(line);
			return {
				element,
				line,
				start: start + fromSec,
				duration: Math.min(toSec, untilSec) - fromSec,
			};
		})
		.filter(({ duration }) => duration > 0);
}

export function layoutCaptions(
	layout: Pick<RenderLayout, "series" | "sequences" | "captionStyle" | "fps">,
): CaptionSequence[] {
	const sequences = allSequences(layout);
	const scenesWithCaptionedSpeech = sceneIdsOf(
		sequences.filter(
			(sequence) => sequence.element.captions && isSpeech(sequence),
		),
	);
	return sequences
		.filter(
			(sequence) => !isVideoInSpokenScene(sequence, scenesWithCaptionedSpeech),
		)
		.flatMap((sequence) =>
			linesUntilNextScene(sequence, layout.series, layout.captionStyle.lineMs),
		)
		.filter(({ start, duration }) => coversAFrame(start, duration, layout.fps))
		.sort((a, b) => a.start - b.start);
}
