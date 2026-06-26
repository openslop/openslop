import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { ensureCharacterAvatars } from "@/lib/project/ensureCharacterAvatars";
import type { GenerationJob, GenerationQueue } from "./queue";

/**
 * Avatar jobs are enqueued first so they sit ahead of caller jobs in the
 * pending queue and run before any element generations that may depend on
 * them.
 */
export function scheduleGeneration(
	queue: GenerationQueue,
	jobs: GenerationJob[],
	{ projectId, registry }: { projectId: string; registry: ConnectorRegistry },
): void {
	ensureCharacterAvatars(queue, projectId, registry);
	queue.enqueueAll(jobs);
}
