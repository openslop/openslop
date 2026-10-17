import type { RetryHandler } from "@vercel/queue";
import { z } from "zod";
import { logger } from "./logger";

// `handleCallback` does not authenticate the delivery, so treat the message as
// untrusted input: keep only the server-issued job id and read the rest of the
// job from its row.
const AssetQueueCallback = z.object({ jobId: z.uuid() });

export function parseAssetQueueCallback(message: unknown): string | undefined {
	const parsed = AssetQueueCallback.safeParse(message);
	if (parsed.success) return parsed.data.jobId;
	logger.error(
		{ issues: parsed.error.issues },
		"Dropped an asset queue message that names no job",
	);
	return undefined;
}

const MAX_RETRY_DELAY_SECONDS = 300;

export const retryWithBackoff: RetryHandler = (_error, { deliveryCount }) => ({
	afterSeconds: Math.min(MAX_RETRY_DELAY_SECONDS, 5 * 2 ** deliveryCount),
});
