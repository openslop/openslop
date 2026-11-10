import type { Descendant } from "slate";
import { isSpeech } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { spokenWords } from "@/lib/canvas/spoken-words";
import { CONTENT_TYPES, type ContentType } from "@/lib/canvas/types";
import { getDuration } from "../canvas/element-attributes";

/** One visual and the dialogue after it, up to the next visual. */
export type VisualSpan = {
	id: string;
	type: ContentType;
	sceneNumber: number;
	words: number;
	dialogueIds: string[];
	/** Its `duration` attribute, where its type has one. */
	durationSec?: number;
};

/** Dialogue before the first visual belongs to no visual. */
export const estimateVisualSpans = (
	descendants: Descendant[],
): VisualSpan[] => {
	const spans: VisualSpan[] = [];

	for (const [sceneIndex, scene] of descendants.filter(isScene).entries()) {
		for (const element of scene.children) {
			const { role, outputKind } = CONTENT_TYPES[element.type];
			if (role === "foreground") {
				spans.push({
					id: element.id,
					type: element.type,
					sceneNumber: sceneIndex + 1,
					words: 0,
					dialogueIds: [],
					...(outputKind === "video" && { durationSec: getDuration(element) }),
				});
				continue;
			}
			const open = spans.at(-1);
			if (!open || !isSpeech(element)) continue;
			open.words += spokenWords(element);
			open.dialogueIds.push(element.id);
		}
	}

	return spans;
};
