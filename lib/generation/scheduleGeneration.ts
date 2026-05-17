import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { ensureCharacterAvatars } from "@/lib/project/ensureCharacterAvatars";
import type { GenerationJob, GenerationQueue } from "./queue";

/**
 * Single entry point for dispatching generation jobs from the editor.
 *
 * Avatar jobs are enqueued first so they sit ahead of caller jobs in the
 * pending queue and run before any element generations that may depend on
 * them.
 */
export function scheduleGeneration(
	queue: GenerationQueue,
	jobs: GenerationJob | GenerationJob[],
	{ projectId, registry }: { projectId: string; registry: ConnectorRegistry },
): void {
	ensureCharacterAvatars(queue, projectId, registry);
	const list = Array.isArray(jobs) ? jobs : [jobs];
	queue.enqueueAll(
		list.map((job) => ({
			...job,
			extraParams: { ...job.extraParams, projectId },
		})),
	);
}
