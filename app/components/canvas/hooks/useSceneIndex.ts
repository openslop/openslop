import { useSlateSelector } from "slate-react";
import { sceneIndexOf } from "@/lib/canvas/scenes";

export function useSceneIndex(sceneId: string): number {
	return useSlateSelector((editor) => sceneIndexOf(editor.children, sceneId));
}
