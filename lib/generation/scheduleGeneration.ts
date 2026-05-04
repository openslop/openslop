import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { ensureCharacterAvatars } from "@/lib/project/ensureCharacterAvatars";
import { generationQueue, type GenerationJob } from "./queue";

/**
 * Single entry point for dispatching generation jobs from the editor.
 *
 * Avatar jobs are enqueued first so they sit ahead of caller jobs in the
 * pending queue and run before any element generations that may depend on
 * them.
 */
export function scheduleGeneration(
	jobs: GenerationJob | GenerationJob[],
	{ projectId, registry }: { projectId: string; registry: ConnectorRegistry },
): void {
	ensureCharacterAvatars(projectId, registry);
	generationQueue.enqueueAll(Array.isArray(jobs) ? jobs : [jobs]);
}
