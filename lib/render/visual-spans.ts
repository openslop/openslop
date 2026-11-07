import sumBy from "lodash/sumBy";
import type { Descendant } from "slate";
import { isSpeech } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { spokenWords } from "@/lib/canvas/spoken-words";
import {
	CONTENT_TYPES,
	type ContentElement,
	type ContentType,
} from "@/lib/canvas/types";
import { getDuration } from "../canvas/element-attributes";
import { elementTrim } from "./clip-trim";
import { transitionOverlapSec, type TransitionType } from "./transitions";
import { MIN_DURATION_SEC } from "./types";
import { estimateSpeechSec } from "../project/video-length";

/** One visual and the dialogue after it, up to the next visual. */
export type VisualSpan = {
	id: string;
	type: ContentType;
	sceneNumber: number;
	seconds: number;
	words: number;
	dialogueIds: string[];
	/** Its `duration` attribute, where its type has one. */
	durationSec?: number;
};

type Span = {
	element: ContentElement;
	sceneNumber: number;
	words: number;
	dialogueIds: string[];
};

/** A video plays for its trim where the user set one, else its duration; a still has no length of its own. */
const ownLength = (
	element: ContentElement,
): Pick<VisualSpan, "durationSec"> & { ownSec: number } => {
	if (CONTENT_TYPES[element.type].outputKind !== "video") return { ownSec: 0 };
	const durationSec = getDuration(element);
	return {
		durationSec,
		ownSec: elementTrim(element, durationSec).trimDurationSec,
	};
};

const toSpan = ({
	element,
	sceneNumber,
	words,
	dialogueIds,
}: Span): VisualSpan => {
	const { durationSec, ownSec } = ownLength(element);
	return {
		id: element.id,
		type: element.type,
		sceneNumber,
		words,
		dialogueIds,
		durationSec,
		seconds: Math.max(ownSec, estimateSpeechSec(words), MIN_DURATION_SEC),
	};
};

type Walk = { spans: Span[]; leadingWords: number };

const walk = (descendants: Descendant[]): Walk => {
	const spans: Span[] = [];
	let leadingWords = 0;
	let sceneNumber = 0;

	for (const node of descendants) {
		if (!isScene(node)) continue;
		sceneNumber += 1;

		for (const element of node.children) {
			if (CONTENT_TYPES[element.type].role === "foreground") {
				spans.push({ element, sceneNumber, words: 0, dialogueIds: [] });
				continue;
			}
			if (!isSpeech(element)) continue;
			const words = spokenWords(element);
			const open = spans.at(-1);
			if (!open) {
				leadingWords += words;
				continue;
			}
			open.words += words;
			open.dialogueIds.push(element.id);
		}
	}

	return { spans, leadingWords };
};

/** Dialogue before the first visual belongs to no visual. */
export const estimateVisualSpans = (descendants: Descendant[]): VisualSpan[] =>
	walk(descendants).spans.map(toSpan);

/** Dialogue before the first visual plays over a blank scene; scenes overlap by the transition. */
export const estimateRuntime = (
	descendants: Descendant[],
	transitionType: TransitionType,
): number => {
	const { spans, leadingWords } = walk(descendants);
	const scenes = spans.length + (leadingWords > 0 ? 1 : 0);
	const overlapSec =
		Math.max(0, scenes - 1) * transitionOverlapSec(transitionType);
	return (
		sumBy(spans, (span) => toSpan(span).seconds) +
		estimateSpeechSec(leadingWords) -
		overlapSec
	);
};
