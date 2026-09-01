import { Runware } from "@runware/sdk-js";
import type { ValidationResult } from "@/lib/connectors/connectorRecord";
import { probe, rejected } from "./validate";

export async function withRunware<T>(
	apiKey: string,
	fn: (runware: InstanceType<typeof Runware>) => Promise<T>,
): Promise<T> {
	const runware = new Runware({
		apiKey,
		timeoutDuration: 600_000,
		shouldReconnect: true,
		globalMaxRetries: 3,
	});
	try {
		return await fn(runware);
	} finally {
		runware.disconnect?.();
	}
}

/**
 * Runware authenticates over the same endpoint every generation uses, and
 * reports a bad key in the body rather than the status.
 */
export async function validateRunwareKey(
	apiKey: string,
): Promise<ValidationResult> {
	const response = await probe("https://api.runware.ai/v1", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify([{ taskType: "authentication", apiKey }]),
	});
	if (!response.ok) return rejected(response.status);
	const body = (await response.json()) as { errors?: unknown[] };
	return body.errors?.length
		? { ok: false, error: "The provider rejected this key." }
		: { ok: true };
}
