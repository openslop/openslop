import { handleCallback } from "@vercel/queue";
import { serializeError } from "serialize-error";
import { getJobHandler } from "@/lib/api/job-handlers";
import type { AssetQueueMessage } from "@/lib/api/jobs";
import { loadJobForProcessing, updateJob } from "@/lib/api/jobs";
import { logger } from "@/lib/api/logger";
import { humanErrorMessage } from "@/lib/errors";

export const POST = handleCallback<AssetQueueMessage>(
	async ({ jobId, connectorType }) => {
		const job = await loadJobForProcessing(jobId);
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
				// A human message: job.error surfaces verbatim in the failure banner
				// via rowView, so it must never be a JSON/stack dump.
				error: humanErrorMessage(error, "Generation failed"),
				// Structured detail for rowView (e.g. Runware's {error:{code,parameter}}),
				// serialized circular-safe so this updateJob can't itself throw mid-catch.
				metadata: { ...job.metadata, errorDetail: serializeError(error) },
			});
			throw error;
		}

		if (outcome.kind === "completed") {
			await updateJob(jobId, { status: "completed", result: outcome.result });
		} else {
			await updateJob(jobId, { metadata: outcome.metadata });
		}
	},
);
