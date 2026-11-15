import { sleep } from "@/lib/utils";

export function mockDelay(ms: number): Promise<void> {
	if (ms <= 0) return Promise.resolve();
	return sleep(ms + Math.random() * ms);
}
