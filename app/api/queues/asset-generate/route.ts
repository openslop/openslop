import { handleCallback } from "@vercel/queue";
import { enqueueJob } from "@/lib/api/job-queue";
import { processQueuedJob } from "@/lib/api/process-job";
import {
	parseAssetQueueCallback,
	retryWithBackoff,
} from "@/lib/api/queue-callback";

export const POST = handleCallback(
	async (message: unknown) => {
		const jobId = parseAssetQueueCallback(message);
		const redelivery = await processQueuedJob(jobId);
		if (redelivery) await enqueueJob(jobId, redelivery);
	},
	{ retry: retryWithBackoff },
);
