import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { ensureCharacterAvatars } from "@/lib/project/ensureCharacterAvatars";
import { generationQueue, type GenerationJob } from "./queue";

/**
 * Single entry point for dispatching generation jobs from the editor.
 *
 * Wires the avatar-setup phase onto the queue so callers don't have to
 * remember to do it themselves; the queue's `before()` guard ensures the
 * setup callback runs at most once per processing cycle even if multiple
 * dispatchers fire back-to-back.
 */
export function scheduleGeneration(
	jobs: GenerationJob | GenerationJob[],
	{ projectId, registry }: { projectId: string; registry: ConnectorRegistry },
): void {
	const list = Array.isArray(jobs) ? jobs : [jobs];
	generationQueue
		.before(() => ensureCharacterAvatars(projectId, registry))
		.enqueueAll(list);
}
