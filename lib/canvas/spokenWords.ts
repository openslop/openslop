import type { Descendant } from "slate";
import { getContentElements } from "./scenes";
import { getElementBodyText } from "./osmlSerializer";
import { ELEMENT_TYPES } from "./types";

export const countWords = (text: string) =>
	text.split(/\s+/).filter(Boolean).length;

/** Words the TTS engine will speak: narration and dialogue, nothing else. */
export function countSpokenWords(descendants: Descendant[]): number {
	return getContentElements(descendants)
		.filter((element) => ELEMENT_TYPES[element.type].connector === "tts")
		.reduce(
			(total, element) => total + countWords(getElementBodyText(element)),
			0,
		);
}
