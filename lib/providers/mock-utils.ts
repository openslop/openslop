import { sleep } from "@/lib/utils";

/** A cent per mock call, so local spend moves the balance like real spend. */
export const MOCK_COST_USD = 0.01;

export function mockDelay(ms: number): Promise<void> {
	if (ms <= 0) return Promise.resolve();
	return sleep(ms + Math.random() * ms);
}
