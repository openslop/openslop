import { send } from "@vercel/queue";
import { isLocalMode } from "@/lib/local-mode";
import type { Redelivery } from "./process-job";

const ASSET_QUEUE_TOPIC = "asset-generate";

export async function enqueueJob(
	jobId: string,
	options?: Redelivery,
): Promise<void> {
	if (isLocalMode()) {
		const { enqueueLocal } = await import("./local-queue");
		enqueueLocal(jobId, options);
		return;
	}
	await send(ASSET_QUEUE_TOPIC, { jobId }, options);
}
