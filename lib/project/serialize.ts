import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { SCENE_TYPE } from "@/lib/canvas/types";
import { SCENE_MARKER_PATTERN } from "@/lib/canvas/constants";
import { parseOSML } from "@/lib/canvas/osmlStreamParser";
import { makeNodeId } from "@/lib/canvas/nodeUtils";
import type { ConnectorModels } from "@/lib/connectors/models";

/** The document a project starts from when there is no generated script. */
export const BLANK_SCRIPT =
	"<narration>Welcome to OpenSlop! Add an element, or ask Sloppy to plan or write a story for you</narration>";

export function splitScenes(osml: string): string[] {
	if (!osml.trim()) return [];
	return osml
		.split(SCENE_MARKER_PATTERN)
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.length > 0);
}

export function deserializeWithScenes(
	osml: string,
	defaultModels?: ConnectorModels,
): SceneElement[] {
	return splitScenes(osml).map((sceneOsml) => ({
		id: makeNodeId(),
		type: SCENE_TYPE,
		children: parseOSML(sceneOsml, defaultModels) as CanvasContentElement[],
	}));
}
