import { useCallback, useSyncExternalStore } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { generationQueue } from "@/lib/generation/queue";
import type { CanvasElement } from "../types";
import { buildGenerationJob } from "../utils/buildGenerationJob";

export function useGenerate(element: CanvasElement) {
  const { connectorConfig } = useConfig();

  const snapshot = useSyncExternalStore(generationQueue.subscribe, () =>
    generationQueue.getElementSnapshot(element.id),
  );

  const generate = useCallback(() => {
    const job = buildGenerationJob(element, connectorConfig);
    if (!job) {
      generationQueue.setError(element.id, "Enter a prompt first");
      return;
    }
    generationQueue.enqueue(job);
  }, [element, connectorConfig]);

  const discard = useCallback(() => {
    generationQueue.discard(element.id);
  }, [element.id]);

  return {
    generating: snapshot.status === "generating",
    queued: snapshot.status === "queued",
    seconds: snapshot.seconds,
    result: snapshot.result,
    error: snapshot.error,
    generate,
    discard,
  };
}
