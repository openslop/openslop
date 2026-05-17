import { handleCallback } from "@vercel/queue";
import { logger } from "@/lib/api/logger";
import type { AssetQueueMessage } from "@/lib/api/jobs";
import { loadJobForProcessing, updateJob } from "@/lib/api/jobs";
import { runAssetJob } from "@/lib/api/providers";
import { stringifyError } from "@/lib/errors";

export const POST = handleCallback<AssetQueueMessage>(
	async ({ jobId, connectorType }) => {
		const job = await loadJobForProcessing(jobId);
		// Vercel Queues may redeliver; skip terminal states so we never re-run a finished job.
		if (job.status === "completed" || job.status === "failed") return;

		await updateJob(jobId, { status: "processing" });
		try {
			const result = await runAssetJob(connectorType, job.request);
			await updateJob(jobId, { status: "completed", result });
		} catch (error) {
			logger.error(error, `Job ${jobId} failed`);
			await updateJob(jobId, {
				status: "failed",
				error: stringifyError(error),
			});
			throw error;
		}
	},
);
