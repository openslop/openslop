import type { RetryHandler } from "@vercel/queue";
import { z } from "zod";
import { logger } from "./logger";

// `handleCallback` does not authenticate the delivery, so treat the message as
// untrusted input: keep only the server-issued job id and read the rest of the
// job from its row.
const AssetQueueCallback = z.object({ jobId: z.uuid() });

export function parseAssetQueueCallback(message: unknown): string {
	const parsed = AssetQueueCallback.safeParse(message);
	if (!parsed.success) {
		throw new Error("Rejected asset queue callback: malformed message");
	}
	return parsed.data.jobId;
}

const MAX_RETRY_DELAY_SECONDS = 300;
// The last delivery lands ~50 min in, past the longest job deadline (video, 45 min).
const MAX_DELIVERIES = 15;

export const retryWithBackoff: RetryHandler = (error, { deliveryCount }) => {
	if (deliveryCount >= MAX_DELIVERIES) {
		logger.error(
			error,
			`Dropped a queue message after ${deliveryCount} deliveries`,
		);
		return { acknowledge: true };
	}
	return {
		afterSeconds: Math.min(MAX_RETRY_DELAY_SECONDS, 5 * 2 ** deliveryCount),
	};
};
