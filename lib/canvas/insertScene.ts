import { Transforms, type Editor, type Path } from "slate";
import { createCanvasElement } from "./createCanvasElement";
import { makeNodeId } from "./nodeUtils";
import { SCENE_TYPE, type Scene } from "./types";

/** The foreground a new scene starts with; `withScenes` drops one without it. */
const NEW_SCENE_ELEMENT = "image";

export function insertScene(editor: Editor, at: Path): string {
	const scene: Scene = {
		id: makeNodeId(),
		type: SCENE_TYPE,
		children: [
			createCanvasElement(NEW_SCENE_ELEMENT, {
				defaultModels: editor.defaultModels(),
			}),
		],
	};
	Transforms.insertNodes(editor, scene, { at });
	return scene.id;
}
