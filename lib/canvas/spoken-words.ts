import type { Descendant } from "slate";
import { getContentElements } from "./scenes";
import { getElementBodyText } from "./osml-serializer";
import { isSpeech } from "./guards";

export const countWords = (text: string) =>
	text.split(/\s+/).filter(Boolean).length;

/** Words the TTS engine will speak: narration and dialogue, nothing else. */
export function countSpokenWords(descendants: Descendant[]): number {
	return getContentElements(descendants)
		.filter(isSpeech)
		.reduce(
			(total, element) => total + countWords(getElementBodyText(element)),
			0,
		);
}
