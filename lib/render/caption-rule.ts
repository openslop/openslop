import { captionSourceOf, isSpeechType } from "@/lib/canvas/types";
import {
	groupIntoLines,
	type CaptionLine,
} from "@/lib/captions/caption-layout";
import { allSequences } from "./sequences";
import type { RenderLayout, Sequence } from "./types";

export type CaptionSequence = Sequence & {
	/** Timed from the element's start, as its words are. */
	line: CaptionLine;
};

const sceneIdsOf = (sequences: Sequence[]) =>
	new Set(sequences.map(({ element }) => element.sceneId));

const isVideoInSpokenScene = (
	{ element }: Sequence,
	spokenScenes: Set<string>,
) =>
	captionSourceOf(element.type) === "video" &&
	spokenScenes.has(element.sceneId);

function captionLines(sequence: Sequence, lineMs: number): CaptionSequence[] {
	const { element, start } = sequence;
	if (!element.captions) return [];
	const { trimIndexOffset, words } = element.captions;
	return groupIntoLines(words, lineMs, trimIndexOffset).map((line) => ({
		element,
		line,
		start: start + line.startMs / 1000,
		duration: line.durationMs / 1000,
		minDuration: 0,
	}));
}

export function layoutCaptions(
	layout: Pick<
		RenderLayout,
		"series" | "sequences" | "captions" | "captionStyle"
	>,
): CaptionSequence[] {
	if (!layout.captions) return [];
	const sequences = allSequences(layout);
	const scenesWithCaptionedSpeech = sceneIdsOf(
		sequences.filter(
			({ element }) => element.captions && isSpeechType(element.type),
		),
	);
	return sequences
		.filter(
			(sequence) => !isVideoInSpokenScene(sequence, scenesWithCaptionedSpeech),
		)
		.flatMap((sequence) => captionLines(sequence, layout.captionStyle.lineMs))
		.sort((a, b) => a.start - b.start);
}
