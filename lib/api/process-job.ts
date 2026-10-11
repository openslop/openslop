import { stringifyError } from "@/lib/errors";
import { isTerminal, JOB_TIMEOUT_MS } from "@/lib/gateway/base";
import { getJobHandler } from "./job-handlers";
import { claimJob, enqueueJob, loadJobForProcessing, updateJob } from "./jobs";
import { logger } from "./logger";

const PENDING_RETRY_SECONDS = 5;

/** Deliveries of one message before a handler error is final. */
export const MAX_ATTEMPTS = 3;

/**
 * Drives one delivery of a queued job. A delivery claims the job (`pending` to
 * `processing`) before its handler runs and releases it after, so a duplicate
 * never runs alongside it. A handler error releases the job and rethrows so the
 * queue redelivers with backoff, until MAX_ATTEMPTS or the deadline.
 */
export async function processQueuedJob(
	jobId: string,
	deliveryCount: number,
): Promise<void> {
	const job = await loadJobForProcessing(jobId);
	if (!job) {
		logger.error({ jobId }, "Dropped a queue message for an unknown job");
		return;
	}
	if (isTerminal(job.status)) return;

	if (Date.now() - Date.parse(job.created_at) > JOB_TIMEOUT_MS) {
		await updateJob(jobId, {
			status: "failed",
			error: `Job timed out after ${JOB_TIMEOUT_MS / 60_000} minutes`,
		});
		return;
	}

	if (job.status === "processing" || !(await claimJob(jobId))) {
		throw new Error(`Job ${jobId} is held by another delivery`);
	}

	const handler = getJobHandler(job.connector_type);

	let outcome;
	try {
		outcome = await handler.process({ ...job, status: "processing" });
	} catch (error) {
		if (deliveryCount < MAX_ATTEMPTS) {
			logger.warn(error, `Job ${jobId} attempt ${deliveryCount} failed`);
			await updateJob(jobId, { status: "pending" });
			throw error;
		}
		logger.error(error, `Job ${jobId} failed`);
		await updateJob(jobId, { status: "failed", error: stringifyError(error) });
		return;
	}

	if (outcome.kind === "completed") {
		await updateJob(jobId, { status: "completed", result: outcome.result });
		return;
	}

	await updateJob(jobId, { status: "pending", metadata: outcome.metadata });
	await enqueueJob(jobId, { delaySeconds: PENDING_RETRY_SECONDS });
}
