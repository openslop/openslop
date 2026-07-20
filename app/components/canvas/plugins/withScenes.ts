import { Transforms, Path, Node, NodeEntry } from "slate";
import { CanvasEditor, SceneElement, SCENE_TYPE } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { isContentElement, isForeground } from "@/lib/canvas/guards";
import { makeNodeId } from "@/lib/canvas/nodeUtils";

/** Returns true when the rule applied a transform and normalization should restart. */
type SceneRule = (editor: CanvasEditor, entry: NodeEntry) => boolean;

const adoptIntoPreviousScene: SceneRule = (editor, [node, path]) => {
	if (!isContentElement(node) || !Path.hasPrevious(path)) return false;
	const prevPath = Path.previous(path);
	const prevNode = Node.getIf(editor, prevPath);
	if (!isSceneElement(prevNode)) return false;
	Transforms.moveNodes(editor, {
		at: path,
		to: [...prevPath, prevNode.children.length],
	});
	return true;
};

const wrapOrphanContent: SceneRule = (editor, [node, path]) => {
	if (!isContentElement(node)) return false;
	const wrapper: SceneElement = {
		id: makeNodeId(),
		type: SCENE_TYPE,
		children: [],
	};
	Transforms.wrapNodes(editor, wrapper, { at: path });
	return true;
};

// Must precede Slate's default normalizer, which would otherwise insert a text
// child into the empty scene and violate SceneElement.children.
const removeEmptyScene: SceneRule = (editor, [node, path]) => {
	if (!isSceneElement(node) || node.children.length > 0) return false;
	Transforms.removeNodes(editor, { at: path });
	return true;
};

const splitExtraForeground: SceneRule = (editor, [node, path]) => {
	if (!isSceneElement(node)) return false;
	const first = node.children.findIndex(isForeground);
	if (first === -1) return false;
	const second = node.children.findIndex(
		(child, i) => i > first && isForeground(child),
	);
	if (second === -1) return false;
	Transforms.splitNodes(editor, {
		at: [...path, second],
		match: isSceneElement,
	});
	return true;
};

const mergeForegroundlessScene: SceneRule = (editor, [node, path]) => {
	if (!isSceneElement(node) || node.children.some(isForeground)) return false;
	if (
		Path.hasPrevious(path) &&
		isSceneElement(Node.getIf(editor, Path.previous(path)))
	) {
		Transforms.mergeNodes(editor, { at: path });
		return true;
	}
	const nextPath = Path.next(path);
	if (isSceneElement(Node.getIf(editor, nextPath))) {
		Transforms.mergeNodes(editor, { at: nextPath });
		return true;
	}
	return false;
};

// Order is load-bearing: each rule assumes the ones above it did not apply.
const SCENE_RULES: readonly SceneRule[] = [
	adoptIntoPreviousScene,
	wrapOrphanContent,
	removeEmptyScene,
	splitExtraForeground,
	mergeForegroundlessScene,
];

export const withScenes = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	editor.normalizeNode = (entry) => {
		if (entry[1].length === 1) {
			for (const rule of SCENE_RULES) {
				if (rule(editor, entry)) return;
			}
		}

		return normalizeNode(entry);
	};

	return editor;
};
