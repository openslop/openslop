import { UnreachableError } from "@/lib/clients/http";
import { sleep } from "@/lib/utils";

export const POLL_INTERVAL_MS = 5000;
const MAX_UNREACHABLE_POLLS = 24;

/** Polls until `isDone`; the server owns the deadline and fails expired jobs. */
export async function awaitCompletion<T>(
	pollFn: (jobId: string) => Promise<T>,
	jobId: string,
	isDone: (result: T) => boolean,
	intervalMs = POLL_INTERVAL_MS,
): Promise<T> {
	let unreachable = 0;
	for (;;) {
		try {
			const result = await pollFn(jobId);
			if (isDone(result)) return result;
			unreachable = 0;
		} catch (error) {
			if (!(error instanceof UnreachableError)) throw error;
			if (++unreachable >= MAX_UNREACHABLE_POLLS) throw error;
		}
		await sleep(intervalMs);
	}
}
