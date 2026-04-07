import { useMemo, useSyncExternalStore } from "react";
import type { Editor } from "slate";
import type { CanvasElement } from "@/app/components/canvas/types";
import { generationQueue } from "@/lib/generation/queue";
import { resolveElements } from "@/lib/video/resolve";
import { buildVideoLayout } from "@/lib/video/scene-builder";
import type { VideoLayout } from "@/lib/video/types";

export function useVideoLayout(
  getEditor: () => Editor | null,
  structureKey: string,
): VideoLayout | null {
  const resultVersion = useSyncExternalStore(
    generationQueue.subscribe,
    generationQueue.getResultVersion,
  );

  return useMemo(() => {
    const editor = getEditor();
    if (!editor) return null;
    const elements = editor.children as CanvasElement[];
    const resolved = resolveElements(
      elements,
      generationQueue.getElementSnapshot,
    );
    return buildVideoLayout(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEditor, structureKey, resultVersion]);
}
