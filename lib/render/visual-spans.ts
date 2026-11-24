import type { Descendant } from "slate";
import { isSpeech } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { spokenWords } from "@/lib/canvas/spoken-words";
import { CONTENT_TYPES, type ContentType } from "@/lib/canvas/types";
import {
	holdsPinnedResult,
	type ElementSnapshot,
} from "@/lib/generation/snapshots";
import { getDuration, getMaxDuration } from "../canvas/element-attributes";

/** A video's `duration` attribute and the longest its model generates. */
export type DurationSetting = { sec: number; maxSec: number };

/** One visual and the speech after it, up to the next visual. */
export type VisualSpan = {
	id: string;
	type: ContentType;
	sceneNumber: number;
	words: number;
	/** Where generating it sets its length. */
	duration?: DurationSetting;
};

/** Speech before the first visual belongs to no visual. */
export const estimateVisualSpans = (
	descendants: Descendant[],
	getSnapshot: (id: string) => ElementSnapshot,
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
					...(outputKind === "video" &&
						!holdsPinnedResult(getSnapshot(element.id)) && {
							duration: {
								sec: getDuration(element),
								maxSec: getMaxDuration(element),
							},
						}),
				});
				continue;
			}
			const open = spans.at(-1);
			if (!open || !isSpeech(element)) continue;
			open.words += spokenWords(element);
		}
	}

	return spans;
};
