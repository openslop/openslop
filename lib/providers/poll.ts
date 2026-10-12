import { UnreachableError } from "@/lib/clients/http";
import { sleep } from "@/lib/utils";

export const POLL_INTERVAL_MS = 5000;

/** Polls until `isDone`; the server owns the deadline and fails expired jobs. */
export async function awaitCompletion<T>(
	pollFn: (jobId: string) => Promise<T>,
	jobId: string,
	isDone: (result: T) => boolean,
	intervalMs = POLL_INTERVAL_MS,
): Promise<T> {
	for (;;) {
		try {
			const result = await pollFn(jobId);
			if (isDone(result)) return result;
		} catch (error) {
			if (!(error instanceof UnreachableError)) throw error;
		}
		await sleep(intervalMs);
	}
}
