import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import { queuedReason } from "@/lib/generation/queued-reason";
import type { GenerationState } from "../elements/preview/status";

export function useGenerationStatus(id: string): GenerationState {
	const { status, startedAt } = useQueueSelector((q) =>
		q.getElementSnapshot(id),
	);
	const reason = useQueueSelector((q) => queuedReason(id, q));
	return { status, startedAt, queuedReason: reason };
}
