import { UnreachableError } from "@/lib/clients/http";
import { sleep } from "@/lib/utils";

const POLL_INTERVAL_MS = 5000;
const MAX_UNREACHABLE_POLLS = 24;

/** Yields each answer; the server owns the deadline and fails expired jobs. */
export async function* pollUpdates<T>(
	poll: () => Promise<T>,
	intervalMs = POLL_INTERVAL_MS,
): AsyncGenerator<T, never> {
	let unreachable = 0;
	for (;;) {
		try {
			yield await poll();
			unreachable = 0;
		} catch (error) {
			if (!(error instanceof UnreachableError)) throw error;
			if (++unreachable >= MAX_UNREACHABLE_POLLS) throw error;
		}
		await sleep(intervalMs);
	}
}

export async function awaitCompletion<T>(
	poll: () => Promise<T>,
	isDone: (result: T) => boolean,
	intervalMs = POLL_INTERVAL_MS,
): Promise<T> {
	const updates = pollUpdates(poll, intervalMs);
	for (;;) {
		const { value } = await updates.next();
		if (isDone(value)) return value;
	}
}
