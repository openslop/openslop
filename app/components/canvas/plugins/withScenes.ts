import { Transforms, Path, Node } from "slate";
import { CanvasEditor, SceneElement, SCENE_TYPE } from "../types";
import {
	isContentElement,
	isForeground,
	isSceneElement,
} from "../utils/guards";
import { makeNodeId } from "../utils/nodeUtils";

export const withScenes = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	editor.normalizeNode = (entry) => {
		const [node, path] = entry;

		if (path.length === 1) {
			if (isContentElement(node)) {
				if (Path.hasPrevious(path)) {
					const prevPath = Path.previous(path);
					const prevNode = Node.getIf(editor, prevPath);
					if (isSceneElement(prevNode)) {
						Transforms.moveNodes(editor, {
							at: path,
							to: [...prevPath, prevNode.children.length],
						});
						return;
					}
				}
				const wrapper: SceneElement = {
					id: makeNodeId(),
					type: SCENE_TYPE,
					children: [],
				};
				Transforms.wrapNodes(editor, wrapper, { at: path });
				return;
			}

			if (isSceneElement(node)) {
				// Remove empty scenes first — otherwise Slate's default normalizer
				// would insert a text child, violating SceneElement.children.
				if (node.children.length === 0) {
					Transforms.removeNodes(editor, { at: path });
					return;
				}

				let foregroundCount = 0;
				for (let i = 0; i < node.children.length; i++) {
					if (isForeground(node.children[i])) {
						foregroundCount++;
						if (foregroundCount > 1) {
							Transforms.splitNodes(editor, {
								at: [...path, i],
								match: isSceneElement,
							});
							return;
						}
					}
				}

				if (foregroundCount === 0) {
					if (
						Path.hasPrevious(path) &&
						isSceneElement(Node.getIf(editor, Path.previous(path)))
					) {
						Transforms.mergeNodes(editor, { at: path });
						return;
					}
					const nextPath = Path.next(path);
					if (isSceneElement(Node.getIf(editor, nextPath))) {
						Transforms.mergeNodes(editor, { at: nextPath });
						return;
					}
				}
			}
		}

		return normalizeNode(entry);
	};

	return editor;
};
