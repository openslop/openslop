import { handleCallback } from "@vercel/queue";
import { processQueuedJob } from "@/lib/api/process-job";
import {
	parseAssetQueueCallback,
	retryWithBackoff,
} from "@/lib/api/queue-callback";

export const POST = handleCallback(
	(message: unknown, { deliveryCount }) =>
		processQueuedJob(parseAssetQueueCallback(message), deliveryCount),
	{ retry: retryWithBackoff },
);
