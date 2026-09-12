import { ELEMENT_TYPES, type CanvasElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { getPromptText } from "@/lib/generation/inputs";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import type { ResolvedElement } from "./types";
import {
	getLoop,
	getTrimToDialogue,
	getLoops,
	getMotion,
	getVolume,
} from "./elementAttributes";

export function resolveElements(
	elements: CanvasElement[],
	getSnapshot: (id: string) => ElementSnapshot,
	{ captionsEnabled }: { captionsEnabled: boolean },
): ResolvedElement[] {
	const resolved: ResolvedElement[] = [];
	let sceneNumber = 0;

	for (const scene of elements) {
		if (!isSceneElement(scene)) continue;
		sceneNumber += 1;

		for (const element of scene.children) {
			const snapshot = getSnapshot(element.id);
			if (!snapshot.result) continue;

			const spec = ELEMENT_TYPES[element.type];
			const url = getPrimaryUrl(snapshot.result, spec.outputKind);
			if (!url) continue;

			const timestamps = snapshot.result.textTimestamps;
			const captionTimestamps =
				captionsEnabled && timestamps?.length ? timestamps : undefined;

			resolved.push({
				id: element.id,
				type: element.type,
				role: spec.role,
				layer: spec.layer,
				sceneId: scene.id,
				sceneNumber,
				prompt: getPromptText(element),
				url,
				durationSec: snapshot.result.durationSec,
				loops: getLoops(element),
				loop: getTrimToDialogue(element) && getLoop(element),
				trimToDialogue: getTrimToDialogue(element),
				volume: getVolume(element),
				motion: getMotion(element),
				captionTimestamps,
			});
		}
	}

	return resolved;
}
