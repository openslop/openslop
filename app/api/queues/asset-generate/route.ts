import { handleCallback } from "@vercel/queue";
import { processQueuedJob } from "@/lib/api/process-job";
import {
	parseAssetQueueCallback,
	retryWithBackoff,
} from "@/lib/api/queue-callback";

export const POST = handleCallback(
	async (message: unknown) => {
		const jobId = parseAssetQueueCallback(message);
		if (jobId) await processQueuedJob(jobId);
	},
	{ retry: retryWithBackoff },
);
