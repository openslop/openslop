import { logger } from "./logger";
import { processQueuedJob, type Redelivery } from "./process-job";

export function enqueueLocal(jobId: string, options?: Redelivery): void {
	setTimeout(
		async () => {
			try {
				const redelivery = await processQueuedJob(jobId);
				if (redelivery) enqueueLocal(jobId, redelivery);
			} catch (error) {
				logger.error(error, `Local delivery of job ${jobId} failed`);
			}
		},
		(options?.delaySeconds ?? 0) * 1000,
	);
}
