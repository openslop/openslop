import { handleCallback } from "@vercel/queue";
import { processQueuedJob } from "@/lib/api/processJob";
import {
	parseAssetQueueCallback,
	retryWithBackoff,
} from "@/lib/api/queueCallback";

export const POST = handleCallback(
	(message: unknown) => processQueuedJob(parseAssetQueueCallback(message)),
	{ retry: retryWithBackoff },
);
