import { useSlateStatic } from "slate-react";
import { isSceneElement } from "../utils/guards";

export function useSceneIndex(sceneId: string): number {
  const editor = useSlateStatic();
  const index = editor.children.findIndex(
    (node) => isSceneElement(node) && node.id === sceneId,
  );
  return index + 1;
}
