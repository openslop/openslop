import { captionSourceOf, isCaptionable } from "@/lib/canvas/types";
import {
	groupIntoLines,
	type CaptionLine,
} from "@/lib/captions/caption-layout";
import { allSequences } from "./sequences";
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

function captionLines(sequence: Sequence, lineMs: number): CaptionSequence[] {
	const { element, start } = sequence;
	if (!element.captions) return [];
	const { firstWordIndex, words } = element.captions;
	return groupIntoLines(words, lineMs, firstWordIndex).map((line) => ({
		element,
		line,
		start: start + line.startMs / 1000,
		duration: line.durationMs / 1000,
	}));
}

export function layoutCaptions(
	layout: Pick<RenderLayout, "series" | "sequences" | "captionStyle">,
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
		.flatMap((sequence) => captionLines(sequence, layout.captionStyle.lineMs))
		.sort((a, b) => a.start - b.start);
}
