import isEqual from "lodash/isEqual";
import { stringifyError } from "@/lib/errors";
import { isTerminal, JOB_TIMEOUT_MS } from "@/lib/gateway/base";
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
	const job = await loadJobForProcessing(jobId);
	if (isTerminal(job.status)) return;

	const connectorType = job.connector_type;
	const handler = getJobHandler(connectorType);
	if (!handler) {
		throw new Error(`No job handler registered for ${connectorType}`);
	}

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
		await updateJob(jobId, { status: "completed", result: outcome.result });
		return;
	}

	if (!isEqual(job.metadata, outcome.metadata)) {
		await updateJob(jobId, { metadata: outcome.metadata });
	}

	const age = Date.now() - Date.parse(job.created_at);
	if (age > JOB_TIMEOUT_MS) {
		await updateJob(jobId, {
			status: "failed",
			error: `Job timed out after ${JOB_TIMEOUT_MS / 60_000} minutes`,
		});
		return;
	}

	await enqueueJob(jobId, connectorType, {
		delaySeconds: PENDING_RETRY_SECONDS,
	});
}
