import sumBy from "lodash/sumBy";
import type { Descendant } from "slate";
import { getContentElements } from "./scenes";
import { getElementBodyText } from "./osml-serializer";
import { isSpeech } from "./guards";
import type { ContentElement } from "./types";
import { estimateSpeechSec } from "../project/video-length";

export const countWords = (text: string) =>
	text.split(/\s+/).filter(Boolean).length;

export const spokenWords = (element: ContentElement) =>
	countWords(getElementBodyText(element));

/** Words the TTS engine will speak: speech, nothing else. */
export function countSpokenWords(descendants: Descendant[]): number {
	return sumBy(getContentElements(descendants).filter(isSpeech), spokenWords);
}

export type SpeechEstimate = Pick<ContentElement, "id"> & {
	words: number;
	seconds: number;
};

export const estimateSpeechLengths = (
	descendants: Descendant[],
): SpeechEstimate[] =>
	getContentElements(descendants)
		.filter(isSpeech)
		.map((element) => {
			const words = spokenWords(element);
			return {
				id: element.id,
				words,
				seconds: estimateSpeechSec(words),
			};
		});
