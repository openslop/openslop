import sumBy from "lodash/sumBy";
import type { Descendant } from "slate";
import { getContentElements } from "./scenes";
import { getElementBodyText } from "./osml-serializer";
import { isSpeech } from "./guards";
import type { ContentElement } from "./types";
import { secondsForWords } from "../project/video-length";

export const countWords = (text: string) =>
	text.split(/\s+/).filter(Boolean).length;

export const spokenWords = (element: ContentElement) =>
	countWords(getElementBodyText(element));

/** Words the TTS engine will speak: narration and dialogue, nothing else. */
export function countSpokenWords(descendants: Descendant[]): number {
	return sumBy(getContentElements(descendants).filter(isSpeech), spokenWords);
}

export type DialogueLength = Pick<ContentElement, "id" | "type"> & {
	words: number;
	seconds: number;
};

/** How long each narration and character line runs, estimated from its words. */
export const measureDialogueLengths = (
	descendants: Descendant[],
): DialogueLength[] =>
	getContentElements(descendants)
		.filter(isSpeech)
		.map((element) => {
			const words = spokenWords(element);
			return {
				id: element.id,
				type: element.type,
				words,
				seconds: secondsForWords(words),
			};
		});
