import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { SCENE_TYPE } from "@/lib/canvas/types";
import { SCENE_MARKER_PATTERN } from "@/lib/canvas/osmlSerializer";
import { parseOSML } from "@/lib/canvas/osmlStreamParser";
import { makeNodeId } from "@/lib/canvas/nodeUtils";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";

export function splitScenes(osml: string): string[] {
	if (!osml.trim()) return [];
	return osml
		.split(SCENE_MARKER_PATTERN)
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.length > 0);
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
