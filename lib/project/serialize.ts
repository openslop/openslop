import { SCENE_TYPE, type AssetElement, type Scene } from "@/lib/canvas/types";
import { SCENE_MARKER_PATTERN } from "@/lib/canvas/constants";
import { isAssetElement, isContentElement } from "@/lib/canvas/guards";
import { parseOSML } from "@/lib/canvas/osml-stream-parser";
import { makeNodeId } from "@/lib/canvas/node-utils";
import type { ConnectorModels } from "@/lib/connectors/models";

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
): (AssetElement | Scene)[] {
	const nodesPerScene = splitScenes(osml).map((sceneOsml) =>
		parseOSML(sceneOsml, defaultModels),
	);
	const scenes = nodesPerScene
		.map((nodes) => nodes.filter(isContentElement))
		.filter((children) => children.length > 0)
		.map(
			(children, index): Scene => ({
				id: sceneId(index),
				type: SCENE_TYPE,
				children,
			}),
		);
	return [...nodesPerScene.flat().filter(isAssetElement), ...scenes];
}
