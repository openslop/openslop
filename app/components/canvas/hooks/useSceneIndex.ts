import memoizeOne from "memoize-one";
import type { Descendant } from "slate";
import { useSlateSelector } from "slate-react";
import { isSceneElement } from "@/lib/canvas/scenes";

// Every scene reads its number on every edit, so the document is numbered once
// per revision rather than searched once per scene.
const numberScenes = memoizeOne(
	(nodes: Descendant[]) =>
		new Map(
			nodes.filter(isSceneElement).map((scene, index) => [scene.id, index + 1]),
		),
);

/** 1-based, or 0 for an id that is not a scene of the document. */
export function useSceneIndex(sceneId: string): number {
	return useSlateSelector(
		(editor) => numberScenes(editor.children).get(sceneId) ?? 0,
	);
}
