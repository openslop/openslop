import type { Descendant } from "slate";
import { isSpeech } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { spokenWords } from "@/lib/canvas/spoken-words";
import { CONTENT_TYPES, type ContentElement } from "@/lib/canvas/types";
import {
	EMPTY_SNAPSHOT,
	type ElementSnapshot,
} from "@/lib/generation/snapshots";
import { getDuration } from "../canvas/element-attributes";
import { estimateSpeechSec } from "../project/video-length";
import { resolveElements } from "./resolve";
import { buildRenderLayout, type BuildLayoutOptions } from "./scene-builder";

/** How long an element plays once generated as the script sets it. */
const scriptedLengthSec = (element: ContentElement): number => {
	if (isSpeech(element)) return estimateSpeechSec(spokenWords(element));
	return CONTENT_TYPES[element.type].outputKind === "video"
		? getDuration(element)
		: 0;
};

// resolveElements lays down only what has media to play.
const STAND_IN_URL = "estimate";

const scriptedSnapshot = (element: ContentElement): ElementSnapshot => ({
	...EMPTY_SNAPSHOT,
	result: {
		durationSec: scriptedLengthSec(element),
		imageUrl: STAND_IN_URL,
		audioUrl: STAND_IN_URL,
		videoUrl: STAND_IN_URL,
	},
});

/** The runtime the layout lays down once every element is generated at the length the script sets. */
export const estimateRuntime = (
	descendants: Descendant[],
	settings: BuildLayoutOptions,
): number => {
	const scenes = descendants.filter(isScene);
	const snapshots = new Map(
		scenes
			.flatMap(({ children }) => children)
			.map((element) => [element.id, scriptedSnapshot(element)]),
	);
	const resolved = resolveElements(
		scenes,
		(id) => snapshots.get(id) ?? EMPTY_SNAPSHOT,
	);
	return buildRenderLayout(resolved, settings).totalDurationSec;
};
