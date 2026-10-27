import { CONTENT_TYPES, type CanvasBlock } from "@/lib/canvas/types";
import { isScene } from "@/lib/canvas/scenes";
import { getPromptText } from "@/lib/generation/inputs";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import type { AssetResult } from "@/lib/connectors/types";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import type { ResolvedCaptions, ResolvedElement } from "./types";
import {
	getLoop,
	getLoops,
	getMotion,
	getVolume,
} from "../canvas/element-attributes";
import { elementTrim, trimTimestamps, type Trim } from "./clip-trim";

function resolveCaptions(
	{ textTimestamps }: AssetResult,
	trim: Trim,
): ResolvedCaptions | undefined {
	if (!textTimestamps?.length) return undefined;
	const words = trimTimestamps(textTimestamps, trim);
	return { firstWordIndex: textTimestamps.length - words.length, words };
}

export function resolveElements(
	blocks: CanvasBlock[],
	getSnapshot: (id: string) => ElementSnapshot,
	{ captionsEnabled }: { captionsEnabled: boolean },
): ResolvedElement[] {
	const resolved: ResolvedElement[] = [];
	let sceneNumber = 0;

	for (const scene of blocks) {
		if (!isScene(scene)) continue;
		sceneNumber += 1;

		for (const element of scene.children) {
			const snapshot = getSnapshot(element.id);
			if (!snapshot.result) continue;

			const spec = CONTENT_TYPES[element.type];
			const url = getPrimaryUrl(snapshot.result, spec.outputKind);
			if (!url) continue;

			const mediaDurationSec = snapshot.result.durationSec;
			const trim = elementTrim(element, mediaDurationSec);

			resolved.push({
				id: element.id,
				type: element.type,
				role: spec.role,
				layer: spec.layer,
				sceneId: scene.id,
				sceneNumber,
				prompt: getPromptText(element),
				url,
				...trim,
				mediaDurationSec,
				loops: getLoops(element),
				loop: getLoop(element),
				volume: getVolume(element),
				motion: getMotion(element),
				captions: captionsEnabled
					? resolveCaptions(snapshot.result, trim)
					: undefined,
			});
		}
	}

	return resolved;
}
