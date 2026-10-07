import {
	SCENE_TYPE,
	type AssetElement,
	type SceneElement,
} from "@/lib/canvas/types";
import { SCENE_MARKER_PATTERN } from "@/lib/canvas/constants";
import { isAssetElement, isParsedContentElement } from "@/lib/canvas/guards";
import { parseOSML } from "@/lib/canvas/osmlStreamParser";
import { makeNodeId } from "@/lib/canvas/nodeUtils";
import type { ConnectorModels } from "@/lib/connectors/models";

/** The document a project starts from when there is no generated script. */
export const BLANK_SCRIPT =
	"<narration>Welcome to OpenSlop! Add an element, or ask Sloppy to plan or write a story for you</narration>";

export function splitScenes(osml: string): string[] {
	return osml
		.split(SCENE_MARKER_PATTERN)
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.length > 0);
}

/** The document a script saves: its assets first, then a scene per marker that holds content. */
export function deserializeWithScenes(
	osml: string,
	defaultModels?: ConnectorModels,
	sceneId: (index: number) => string = makeNodeId,
): (AssetElement | SceneElement)[] {
	const chunks = splitScenes(osml).map((sceneOsml) =>
		parseOSML(sceneOsml, defaultModels),
	);
	const scenes = chunks
		.map((nodes) => nodes.filter(isParsedContentElement))
		.filter((children) => children.length > 0)
		.map(
			(children, index): SceneElement => ({
				id: sceneId(index),
				type: SCENE_TYPE,
				children,
			}),
		);
	return [...chunks.flat().filter(isAssetElement), ...scenes];
}
