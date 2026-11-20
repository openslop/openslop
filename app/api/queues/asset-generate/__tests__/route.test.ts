import { describe, expect, it, vi } from "vitest";

vi.mock("@vercel/queue", () => ({
	handleCallback: (handler: (message: unknown) => Promise<void>) => handler,
}));

const mockProcessQueuedJob = vi.fn();
vi.mock("@/lib/api/process-job", () => ({
	processQueuedJob: (...args: unknown[]) => mockProcessQueuedJob(...args),
}));

const mockEnqueueJob = vi.fn();
vi.mock("@/lib/api/job-queue", () => ({
	enqueueJob: (...args: unknown[]) => mockEnqueueJob(...args),
}));

const { POST } = await import("../route");
const deliver = POST as unknown as (message: unknown) => Promise<void>;

const JOB_ID = "8c69f697-4ea8-4d76-86e9-bfd1678f8bed";

describe("asset-generate queue callback", () => {
	it("queues the next delivery when the job asks for one", async () => {
		mockProcessQueuedJob.mockResolvedValue({ delaySeconds: 5 });

		await deliver({ jobId: JOB_ID });

		expect(mockProcessQueuedJob).toHaveBeenCalledExactlyOnceWith(JOB_ID);
		expect(mockEnqueueJob).toHaveBeenCalledExactlyOnceWith(JOB_ID, {
			delaySeconds: 5,
		});
	});

	it("queues nothing once the job is settled", async () => {
		mockProcessQueuedJob.mockResolvedValue(null);

		await deliver({ jobId: JOB_ID });

		expect(mockEnqueueJob).not.toHaveBeenCalled();
	});

	it("propagates a redelivery failure so the queue retries", async () => {
		mockProcessQueuedJob.mockResolvedValue({ delaySeconds: 5 });
		mockEnqueueJob.mockRejectedValue(new Error("queue unavailable"));

		await expect(deliver({ jobId: JOB_ID })).rejects.toThrow(
			"queue unavailable",
		);
	});
});
