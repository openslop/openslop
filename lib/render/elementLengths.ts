import type { Descendant } from "slate";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { isSceneElement } from "@/lib/canvas/scenes";
import { countWords } from "@/lib/canvas/spokenWords";
import {
	ELEMENT_TYPES,
	FOREGROUND_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";
import { getDuration, getTrimToDialogue } from "../canvas/elementAttributes";
import { MIN_DURATION_SEC } from "./scene-builder";
import { secondsForWords } from "../project/videoLength";

/** How long one visual holds the screen, and what decides it. */
export type ElementLength = {
	id: string;
	type: CanvasElementType;
	sceneNumber: number;
	seconds: number;
	/** The spoken words that follow it, up to the next visual. */
	words: number;
	dialogueIds: string[];
	/** The length it is generated at, where its type has one at all. */
	durationSec?: number;
	/** Whether it yields to its dialogue, or plays its own length in full. */
	trimToDialogue: boolean;
	/** Which of its own duration, its dialogue or the minimum set `seconds`. */
	decidedBy: "duration" | "dialogue" | "minimum";
};

type Span = {
	element: CanvasContentElement;
	sceneNumber: number;
	words: number;
	dialogueIds: string[];
};

/** A generated video runs for its own length; a still has none of its own. */
const ownDuration = (element: CanvasContentElement): number | undefined =>
	ELEMENT_TYPES[element.type].outputKind === "video"
		? getDuration(element)
		: undefined;

const decide = (
	ownSec: number,
	dialogueSec: number,
): Pick<ElementLength, "seconds" | "decidedBy"> => {
	if (ownSec >= dialogueSec && ownSec >= MIN_DURATION_SEC)
		return { seconds: ownSec, decidedBy: "duration" };
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
	const trimToDialogue = getTrimToDialogue(element);
	return {
		id: element.id,
		type: element.type,
		sceneNumber,
		words,
		dialogueIds,
		durationSec,
		trimToDialogue,
		...decide(trimToDialogue ? 0 : (durationSec ?? 0), secondsForWords(words)),
	};
};

type Walk = { spans: Span[]; leadingWords: number };

const walk = (descendants: Descendant[]): Walk => {
	const spans: Span[] = [];
	let leadingWords = 0;
	let sceneNumber = 0;

	for (const node of descendants) {
		if (!isSceneElement(node)) continue;
		sceneNumber += 1;

		for (const element of node.children) {
			if (FOREGROUND_TYPES.has(element.type)) {
				spans.push({ element, sceneNumber, words: 0, dialogueIds: [] });
				continue;
			}
			if (ELEMENT_TYPES[element.type].connector !== "tts") continue;
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
