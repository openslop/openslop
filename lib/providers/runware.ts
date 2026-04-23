import { Runware } from "@runware/sdk-js";

export async function withRunware<T>(
	apiKey: string,
	fn: (runware: InstanceType<typeof Runware>) => Promise<T>,
): Promise<T> {
	const runware = new Runware({ apiKey });
	try {
		return await fn(runware);
	} finally {
		runware.disconnect?.();
	}
}
