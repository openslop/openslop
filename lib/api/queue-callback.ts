import { z } from "zod";

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
