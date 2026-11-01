import type { Descendant } from "slate";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { isSpeech } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { countWords } from "@/lib/canvas/spoken-words";
import {
	CONTENT_TYPES,
	type ContentElement,
	type ContentType,
} from "@/lib/canvas/types";
import { getDuration } from "../canvas/element-attributes";
import { elementTrim, isTrimmed } from "./clip-trim";
import { MIN_DURATION_SEC } from "./scene-builder";
import { secondsForWords } from "../project/video-length";

/** How long one visual holds the screen, and what decides it. */
export type ElementLength = {
	id: string;
	type: ContentType;
	sceneNumber: number;
	seconds: number;
	/** The spoken words that follow it, up to the next visual. */
	words: number;
	dialogueIds: string[];
	/** The length it is generated at, where its type has one at all. */
	durationSec?: number;
	/** The length its timeline trim holds it to, where the user trimmed it. */
	trimmedSec?: number;
	/** Which of its own duration, its trim, its dialogue or the minimum set `seconds`. */
	decidedBy: "duration" | "trim" | "dialogue" | "minimum";
};

type Span = {
	element: ContentElement;
	sceneNumber: number;
	words: number;
	dialogueIds: string[];
};

/** A generated video runs for its own length; a still has none of its own. */
const ownDuration = (element: ContentElement): number | undefined =>
	CONTENT_TYPES[element.type].outputKind === "video"
		? getDuration(element)
		: undefined;

const trimmedDuration = (
	element: ContentElement,
	mediaDurationSec: number,
): number | undefined => {
	const trim = elementTrim(element, mediaDurationSec);
	return isTrimmed({ ...trim, mediaDurationSec })
		? trim.durationSec
		: undefined;
};

type Own = Pick<ElementLength, "durationSec" | "trimmedSec">;

/** The length a video brings of its own: its trim where the user set one, else its duration. */
export const ownLength = ({ durationSec, trimmedSec }: Own) => {
	if (trimmedSec !== undefined)
		return { seconds: trimmedSec, decidedBy: "trim" as const };
	if (durationSec !== undefined)
		return { seconds: durationSec, decidedBy: "duration" as const };
	return undefined;
};

export const hasDialogue = ({ words }: Pick<ElementLength, "words">) =>
	words > 0;

const decide = (
	own: Own,
	dialogueSec: number,
): Pick<ElementLength, "seconds" | "decidedBy"> => {
	const held = ownLength(own);
	if (held && held.seconds >= dialogueSec && held.seconds >= MIN_DURATION_SEC)
		return held;
	if (dialogueSec >= MIN_DURATION_SEC)
		return { seconds: dialogueSec, decidedBy: "dialogue" };
	return { seconds: MIN_DURATION_SEC, decidedBy: "minimum" };
};

const toLength = ({
	element,
	sceneNumber,
	words,
	dialogueIds,
}: Span): ElementLength => {
	const durationSec = ownDuration(element);
	const own = {
		durationSec,
		trimmedSec: trimmedDuration(element, durationSec ?? 0),
	};
	return {
		id: element.id,
		type: element.type,
		sceneNumber,
		words,
		dialogueIds,
		...own,
		...decide(own, secondsForWords(words)),
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
			const words = countWords(getElementBodyText(element));
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

/**
 * What every visual on the canvas is on screen for, estimated from the script
 * alone: the same rule `buildRenderLayout` lays out with, read off the unrendered
 * script. Dialogue before the first visual belongs to no visual and is left out.
 */
export const measureElementLengths = (
	descendants: Descendant[],
): ElementLength[] => walk(descendants).spans.map(toLength);

/** The whole video's length, dialogue before the first visual included: it plays over a blank scene. */
export const measureRuntime = (descendants: Descendant[]): number => {
	const { spans, leadingWords } = walk(descendants);
	return spans
		.map(toLength)
		.reduce(
			(total, { seconds }) => total + seconds,
			secondsForWords(leadingWords),
		);
};
