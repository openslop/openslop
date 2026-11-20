import { errorMessage } from "@/lib/errors";
import { isTerminal } from "@/lib/gateway/base";
import { chargedUsd } from "@/lib/providers/base";
import { failIfExpired } from "./job-deadline";
import { getJobHandler } from "./job-handlers";
import { claimJob, loadJobForProcessing, updateJob } from "./jobs";
import { logger } from "./logger";

const PENDING_RETRY_SECONDS = 5;

export type Redelivery = { delaySeconds: number };

/**
 * Drives one delivery of a queued job. Handlers whose provider is still
 * working return `pending`, and the job asks to be redelivered to this same
 * function until it completes or outlives the deadline.
 */
export async function processQueuedJob(
	jobId: string,
): Promise<Redelivery | null> {
	const loaded = await loadJobForProcessing(jobId);
	if (!loaded) {
		logger.error({ jobId }, "Dropped a queue message for an unknown job");
		return null;
	}
	const job = await failIfExpired(loaded);
	if (isTerminal(job.status)) return null;

	if (job.status === "processing" || !(await claimJob(jobId))) {
		throw new Error(`Job ${jobId} is held by another delivery`);
	}

	const handler = getJobHandler(job.connector_type);

	let outcome;
	try {
		outcome = await handler.process(job);
	} catch (error) {
		logger.error(error, `Job ${jobId} failed`);
		await updateJob(jobId, {
			status: "failed",
			error: errorMessage(error),
			cost_usd: chargedUsd(error),
		});
		throw error;
	}

	if (outcome.kind === "completed") {
		await updateJob(jobId, {
			status: "completed",
			result: outcome.result,
			cost_usd: outcome.costUsd,
		});
		return null;
	}

	await updateJob(jobId, { status: "pending", metadata: outcome.metadata });
	return { delaySeconds: PENDING_RETRY_SECONDS };
}
