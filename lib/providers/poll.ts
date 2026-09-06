import { UnreachableError } from "@/lib/clients/http";
import { JOB_TIMEOUT_MS } from "@/lib/gateway/base";
import { sleep } from "@/lib/utils";

export const POLL_INTERVAL_MS = 5000;

export async function awaitCompletion<T>(
	pollFn: (jobId: string) => Promise<T>,
	jobId: string,
	isDone: (result: T) => boolean,
	intervalMs = POLL_INTERVAL_MS,
	timeoutMs = JOB_TIMEOUT_MS,
): Promise<T> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const result = await pollFn(jobId);
			if (isDone(result)) return result;
		} catch (error) {
			if (!(error instanceof UnreachableError)) throw error;
		}
		await sleep(intervalMs);
	}
	throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
}
