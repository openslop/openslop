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
		let result;
		try {
			result = await runAssetJob(connectorType, job.request, {
				providerJobId: job.provider_job_id,
				onProviderJob: (id) => updateJob(jobId, { providerJobId: id }),
			});
		} catch (error) {
			logger.error(error, `Job ${jobId} failed`);
			await updateJob(jobId, {
				status: "failed",
				error: stringifyError(error),
			});
			throw error;
		}
		// Throwing here (transient db failure) lets the queue redeliver; the
		// job is still `processing`, so the next attempt re-enters runAssetJob,
		// which resumes polling via provider_job_id for video.
		await updateJob(jobId, { status: "completed", result });
	},
);
