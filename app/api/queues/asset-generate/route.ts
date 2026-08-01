import { handleCallback } from "@vercel/queue";
import { getJobHandler } from "@/lib/api/job-handlers";
import type { AssetQueueMessage } from "@/lib/api/jobs";
import { loadJobForProcessing, updateJob } from "@/lib/api/jobs";
import { logger } from "@/lib/api/logger";
import { stringifyError } from "@/lib/errors";
import { isTerminal } from "@/lib/gateway/base";

export const POST = handleCallback<AssetQueueMessage>(
	async ({ jobId, connectorType }) => {
		const job = await loadJobForProcessing(jobId);
		if (isTerminal(job.status)) return;

		await updateJob(jobId, { status: "processing" });

		// Every failure past this point has to land on the row: the client only
		// ever learns the outcome by polling it, so a job left `processing`
		// after the queue exhausts its retries is polled forever.
		try {
			const handler = getJobHandler(connectorType);
			if (!handler) {
				throw new Error(`No job handler registered for ${connectorType}`);
			}
			const outcome = await handler.process(job);
			if (outcome.kind === "completed") {
				await updateJob(jobId, { status: "completed", result: outcome.result });
			} else {
				await updateJob(jobId, { metadata: outcome.metadata });
			}
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
