import { Transforms, type Editor, type Path } from "slate";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { createCanvasNode } from "./createCanvasNode";
import { makeNodeId } from "./nodeUtils";
import { SCENE_TYPE, type SceneElement } from "./types";

/** The foreground a new scene starts with; `withScenes` drops one without it. */
const NEW_SCENE_ELEMENT = "image";

export function insertScene(
	editor: Editor,
	at: Path,
	connectors: ConnectorRegistry,
): string {
	const scene: SceneElement = {
		id: makeNodeId(),
		type: SCENE_TYPE,
		children: [createCanvasNode(NEW_SCENE_ELEMENT, connectors)],
	};
	Transforms.insertNodes(editor, scene, { at });
	return scene.id;
}
