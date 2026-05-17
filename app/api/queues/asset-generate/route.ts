import { handleCallback } from "@vercel/queue";
import { getJobHandler } from "@/lib/api/job-handlers";
import type { AssetQueueMessage } from "@/lib/api/jobs";
import { loadJobForProcessing, updateJob } from "@/lib/api/jobs";
import { logger } from "@/lib/api/logger";
import { stringifyError } from "@/lib/errors";

export const POST = handleCallback<AssetQueueMessage>(
	async ({ jobId, connectorType }) => {
		const job = await loadJobForProcessing(jobId);
		// Skip terminal-state redeliveries.
		if (job.status === "completed" || job.status === "failed") return;

		const handler = getJobHandler(connectorType);
		if (!handler) {
			throw new Error(`No job handler registered for ${connectorType}`);
		}

		await updateJob(jobId, { status: "processing" });
		let outcome;
		try {
			outcome = await handler.process(job);
		} catch (error) {
			logger.error(error, `Job ${jobId} failed`);
			await updateJob(jobId, {
				status: "failed",
				error: stringifyError(error),
			});
			throw error;
		}
		// Persistence below is outside the catch — a transient db failure here
		// lets the queue redeliver from `processing` instead of locking the row
		// to `failed` and losing the result.
		if (outcome.kind === "completed") {
			await updateJob(jobId, { status: "completed", result: outcome.result });
		} else {
			await updateJob(jobId, { metadata: outcome.metadata });
		}
	},
);
