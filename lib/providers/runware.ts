import { Runware } from "@runware/sdk-js";

export async function withRunware<T>(
	apiKey: string,
	fn: (runware: InstanceType<typeof Runware>) => Promise<T>,
): Promise<T> {
	const runware = new Runware({
		apiKey,
		timeoutDuration: 180_000,
		shouldReconnect: true,
		globalMaxRetries: 3,
	});
	try {
		return await fn(runware);
	} catch (e) {
		throw e instanceof Error
			? e
			: new Error(typeof e === "string" ? e : JSON.stringify(e));
	} finally {
		runware.disconnect?.();
	}
}
