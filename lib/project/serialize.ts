import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { SCENE_TYPE } from "@/lib/canvas/types";
import { SCENE_MARKER_PATTERN } from "@/lib/canvas/osmlSerializer";
import { parseOSML } from "@/lib/canvas/osmlStreamParser";
import { makeNodeId } from "@/lib/canvas/nodeUtils";
import type { ConnectorRegistry } from "@/lib/connectors/registry";

/** The document a project starts from when there is no generated script. */
export const BLANK_SCRIPT = "<narration></narration>";

const ELEMENT_TAG = /<(\/?)[A-Za-z_][^<>]*>/g;

/** Element tags never nest, so the last one on a line decides what follows it. */
function isInsideElement(line: string, open: boolean): boolean {
	const last = [...line.matchAll(ELEMENT_TAG)].at(-1);
	return last ? last[1] !== "/" : open;
}

/**
 * Scene markers only separate scenes between elements. Element text can hold a
 * line that reads as one, and splitting there would cut the element in half and
 * lose the rest of the scene on the next load.
 */
export function splitScenes(osml: string): string[] {
	const scenes: string[][] = [[]];
	let insideElement = false;

	for (const line of osml.split("\n")) {
		if (!insideElement && SCENE_MARKER_PATTERN.test(line)) {
			scenes.push([]);
			continue;
		}
		scenes[scenes.length - 1].push(line);
		insideElement = isInsideElement(line, insideElement);
	}

	return scenes.map((lines) => lines.join("\n").trim()).filter(Boolean);
}

export function deserializeWithScenes(
	osml: string,
	connectors: ConnectorRegistry,
): SceneElement[] {
	return splitScenes(osml).map((sceneOsml) => ({
		id: makeNodeId(),
		type: SCENE_TYPE,
		children: parseOSML(sceneOsml, connectors) as CanvasContentElement[],
	}));
}
