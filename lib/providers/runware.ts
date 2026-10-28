import { Runware } from "@runware/sdk-js";
import { z } from "zod";
import type { ValidationResult } from "@/lib/connectors/provider-key";
import { fromStatus, probe, rejected } from "./validate";

/** The SDK rejects a refused task with the API's error object. */
const RefusedTask = z.object({ error: z.object({ message: z.string() }) });

const AuthAnswer = z.object({ errors: z.array(z.unknown()).optional() });

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
	} catch (rejection) {
		const refused = RefusedTask.safeParse(rejection);
		if (refused.success)
			throw new Error(`Runware: ${refused.data.error.message}`, {
				cause: rejection,
			});
		throw rejection;
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
	if (!response.ok) return fromStatus(response);
	const { errors } = AuthAnswer.parse(await response.json());
	return errors?.length ? rejected : { ok: true };
}
