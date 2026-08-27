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
import { getDuration } from "./elementAttributes";
import { MIN_DURATION_SEC } from "./scene-builder";
import { secondsForWords } from "./videoLength";

/** How long one visual holds the screen, and what decides it. */
export type ElementLength = {
	id: string;
	type: CanvasElementType;
	sceneNumber: number;
	seconds: number;
	/** The spoken words that follow it, up to the next visual. */
	words: number;
	dialogueIds: string[];
	/** The length the clip is generated at, where the type has one at all. */
	durationSec?: number;
};

type Span = {
	element: CanvasContentElement;
	sceneNumber: number;
	words: number;
	dialogueIds: string[];
};

/** A generated clip runs for its own length; a still has none of its own. */
const ownDuration = (element: CanvasContentElement): number | undefined =>
	ELEMENT_TYPES[element.type].outputKind === "video"
		? getDuration(element)
		: undefined;

const toLength = (
	{ element, sceneNumber, words, dialogueIds }: Span,
	trimVisualsToDialogue: boolean,
): ElementLength => ({
	id: element.id,
	type: element.type,
	sceneNumber,
	words,
	dialogueIds,
	durationSec: ownDuration(element),
	seconds: Math.max(
		secondsForWords(words),
		trimVisualsToDialogue ? 0 : (ownDuration(element) ?? 0),
		MIN_DURATION_SEC,
	),
});

/**
 * What every visual on the canvas is on screen for, estimated from the script
 * alone: the same rule `buildVideoLayout` lays out with, read off the unrendered
 * script. Dialogue before the first visual belongs to no visual and is left out.
 */
export function measureElementLengths(
	descendants: Descendant[],
	trimVisualsToDialogue: boolean,
): ElementLength[] {
	const spans: Span[] = [];
	let sceneNumber = 0;

	for (const node of descendants) {
		if (!isSceneElement(node)) continue;
		sceneNumber += 1;

		for (const element of node.children) {
			if (FOREGROUND_TYPES.has(element.type)) {
				spans.push({ element, sceneNumber, words: 0, dialogueIds: [] });
				continue;
			}
			const open = spans.at(-1);
			if (!open || ELEMENT_TYPES[element.type].connector !== "tts") continue;
			open.words += countWords(getElementBodyText(element));
			open.dialogueIds.push(element.id);
		}
	}

	return spans.map((span) => toLength(span, trimVisualsToDialogue));
}
