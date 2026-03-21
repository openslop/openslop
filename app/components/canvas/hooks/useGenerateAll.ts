import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { generationQueue } from "@/lib/generation/queue";
import type { CanvasElement } from "../types";
import { buildGenerationJob } from "../utils/buildGenerationJob";

export function useGenerateAll() {
  const editor = useSlateStatic();
  const { connectorConfig } = useConfig();

  const generateAll = useCallback(() => {
    const jobs = (editor.children as CanvasElement[])
      .map((el) => buildGenerationJob(el, connectorConfig))
      .filter((job): job is NonNullable<typeof job> => job !== null);
    generationQueue.enqueueAll(jobs);
  }, [editor, connectorConfig]);

  const cancelAll = useCallback(() => generationQueue.cancelAll(), []);

  return { generateAll, cancelAll };
}
