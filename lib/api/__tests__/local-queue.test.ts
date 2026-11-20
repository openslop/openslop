import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockProcessQueuedJob = vi.fn();
vi.mock("@/lib/api/process-job", () => ({
	processQueuedJob: (...args: unknown[]) => mockProcessQueuedJob(...args),
}));

const logger = vi.hoisted(() => ({ error: vi.fn() }));
vi.mock("@/lib/api/logger", () => ({ logger }));

const { enqueueLocal } = await import("@/lib/api/local-queue");

const JOB_ID = "job-1";

describe("enqueueLocal", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("processes the job after the delay", async () => {
		mockProcessQueuedJob.mockResolvedValue(null);

		enqueueLocal(JOB_ID, { delaySeconds: 5 });
		await vi.advanceTimersByTimeAsync(4999);
		expect(mockProcessQueuedJob).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(mockProcessQueuedJob).toHaveBeenCalledExactlyOnceWith(JOB_ID);
	});

	it("processes it again while the provider is still working", async () => {
		mockProcessQueuedJob
			.mockResolvedValueOnce({ delaySeconds: 5 })
			.mockResolvedValueOnce(null);

		enqueueLocal(JOB_ID);
		await vi.advanceTimersByTimeAsync(0);
		await vi.advanceTimersByTimeAsync(5000);

		expect(mockProcessQueuedJob).toHaveBeenCalledTimes(2);
	});

	it("logs a failed delivery instead of crashing the server", async () => {
		const failure = new Error("provider down");
		mockProcessQueuedJob.mockRejectedValue(failure);

		enqueueLocal(JOB_ID);
		await vi.advanceTimersByTimeAsync(0);

		expect(logger.error).toHaveBeenCalledWith(failure, expect.any(String));
	});
});
