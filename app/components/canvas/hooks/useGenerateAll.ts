import { useCallback } from "react";
import { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { generationQueue } from "@/lib/generation/queue";
import type { CanvasElement } from "../types";
import { buildGenerationJob } from "../utils/buildGenerationJob";

export function useGenerateAll(editor: Editor) {
  const { connectorConfig } = useConfig();

  const generateAll = useCallback(() => {
    const jobs = (editor.children as CanvasElement[])
      .map((el) => buildGenerationJob(el, connectorConfig))
      .filter((job): job is NonNullable<typeof job> => job !== null);
    generationQueue.enqueueAll(jobs);
  }, [editor, connectorConfig]);

  return { generateAll };
}
