import isEqual from "lodash/isEqual";
import { stringifyError } from "@/lib/errors";
import { isTerminal } from "@/lib/gateway/base";
import { failIfExpired } from "./job-deadline";
import { getJobHandler } from "./job-handlers";
import { enqueueJob, loadJobForProcessing, updateJob } from "./jobs";
import { logger } from "./logger";

const PENDING_RETRY_SECONDS = 5;

/**
 * Drives one delivery of a queued job. Handlers whose provider is still
 * working return `pending`, and the job is redelivered to this same function
 * until it completes or outlives the deadline.
 */
export async function processQueuedJob(jobId: string): Promise<void> {
	const loaded = await loadJobForProcessing(jobId);
	if (!loaded) {
		logger.error({ jobId }, "Dropped a queue message for an unknown job");
		return;
	}
	const job = await failIfExpired(loaded);
	if (isTerminal(job.status)) return;

	const handler = getJobHandler(job.connector_type);

	if (job.status !== "processing") {
		await updateJob(jobId, { status: "processing" });
	}

	let outcome;
	try {
		outcome = await handler.process(job);
	} catch (error) {
		logger.error(error, `Job ${jobId} failed`);
		await updateJob(jobId, { status: "failed", error: stringifyError(error) });
		throw error;
	}

	if (outcome.kind === "completed") {
		await updateJob(jobId, {
			status: "completed",
			result: outcome.result,
			cost_usd: outcome.costUsd,
		});
		return;
	}

	if (!isEqual(job.metadata, outcome.metadata)) {
		await updateJob(jobId, { metadata: outcome.metadata });
	}

	await enqueueJob(jobId, { delaySeconds: PENDING_RETRY_SECONDS });
}
