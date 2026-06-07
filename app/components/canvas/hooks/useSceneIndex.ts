import { useSlateStatic } from "slate-react";
import { sceneIndexOf } from "@/lib/canvas/scenes";

export function useSceneIndex(sceneId: string): number {
	const editor = useSlateStatic();
	return sceneIndexOf(editor.children, sceneId);
}
