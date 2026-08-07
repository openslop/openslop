import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AssetQueueMessage } from "@/lib/api/jobs";
import { JOB_TIMEOUT_MS } from "@/lib/gateway/base";

const mockLoadJobForProcessing = vi.fn();
const mockUpdateJob = vi.fn();
const mockEnqueueJob = vi.fn();
vi.mock("@/lib/api/jobs", () => ({
	loadJobForProcessing: (...args: unknown[]) =>
		mockLoadJobForProcessing(...args),
	updateJob: (...args: unknown[]) => mockUpdateJob(...args),
	enqueueJob: (...args: unknown[]) => mockEnqueueJob(...args),
}));

const mockGetJobHandler = vi.fn();
vi.mock("@/lib/api/job-handlers", () => ({
	getJobHandler: (...args: unknown[]) => mockGetJobHandler(...args),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const { processQueuedJob } = await import("@/lib/api/process-job");

const message: AssetQueueMessage = { jobId: "job-1", connectorType: "image" };

function stubPendingHandler(metadata: Record<string, unknown> = {}) {
	mockGetJobHandler.mockReturnValue({
		process: vi.fn().mockResolvedValue({ kind: "pending", metadata }),
	});
}

function pendingJob(ageMs = 0) {
	return {
		status: "pending",
		id: "job-1",
		created_at: new Date(Date.now() - ageMs).toISOString(),
	};
}

describe("processQueuedJob", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUpdateJob.mockResolvedValue(undefined);
		mockEnqueueJob.mockResolvedValue(undefined);
	});

	it("skips jobs that already completed", async () => {
		mockLoadJobForProcessing.mockResolvedValue({ status: "completed" });

		await processQueuedJob(message);

		expect(mockGetJobHandler).not.toHaveBeenCalled();
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("skips jobs that already failed", async () => {
		mockLoadJobForProcessing.mockResolvedValue({ status: "failed" });

		await processQueuedJob(message);

		expect(mockGetJobHandler).not.toHaveBeenCalled();
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("throws when no handler is registered for the connector type", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		mockGetJobHandler.mockReturnValue(undefined);

		await expect(processQueuedJob(message)).rejects.toThrow(
			"No job handler registered for image",
		);
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("marks the job processing then completed with the handler result", async () => {
		const job = pendingJob();
		mockLoadJobForProcessing.mockResolvedValue(job);
		const handler = {
			process: vi
				.fn()
				.mockResolvedValue({ kind: "completed", result: { url: "u" } }),
		};
		mockGetJobHandler.mockReturnValue(handler);

		await processQueuedJob(message);

		expect(handler.process).toHaveBeenCalledWith(job);
		expect(mockUpdateJob).toHaveBeenNthCalledWith(1, "job-1", {
			status: "processing",
		});
		expect(mockUpdateJob).toHaveBeenNthCalledWith(2, "job-1", {
			status: "completed",
			result: { url: "u" },
		});
	});

	it("stores metadata for pending outcomes without completing the job", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		stubPendingHandler({ poll: "token" });

		await processQueuedJob(message);

		expect(mockUpdateJob).toHaveBeenNthCalledWith(2, "job-1", {
			metadata: { poll: "token" },
		});
	});

	it("skips redundant writes when redelivered with unchanged state", async () => {
		mockLoadJobForProcessing.mockResolvedValue({
			...pendingJob(),
			status: "processing",
			metadata: { providerJobId: "upstream-1" },
		});
		stubPendingHandler({ providerJobId: "upstream-1" });

		await processQueuedJob(message);

		expect(mockUpdateJob).not.toHaveBeenCalled();
		expect(mockEnqueueJob).toHaveBeenCalled();
	});

	it("redelivers pending jobs to itself after a delay", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		stubPendingHandler();

		await processQueuedJob(message);

		expect(mockEnqueueJob).toHaveBeenCalledWith("job-1", "image", {
			delaySeconds: expect.any(Number),
		});
	});

	it("does not redeliver completed jobs", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		mockGetJobHandler.mockReturnValue({
			process: vi.fn().mockResolvedValue({ kind: "completed", result: {} }),
		});

		await processQueuedJob(message);

		expect(mockEnqueueJob).not.toHaveBeenCalled();
	});

	it("propagates a redelivery failure so the queue retries instead of failing the job", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		stubPendingHandler();
		mockEnqueueJob.mockRejectedValue(new Error("queue unavailable"));

		await expect(processQueuedJob(message)).rejects.toThrow(
			"queue unavailable",
		);
		expect(mockUpdateJob).not.toHaveBeenCalledWith(
			"job-1",
			expect.objectContaining({ status: "failed" }),
		);
	});

	it("stops redelivering a job that is still pending past the deadline", async () => {
		mockLoadJobForProcessing.mockResolvedValue(
			pendingJob(JOB_TIMEOUT_MS + 60_000),
		);
		stubPendingHandler();

		await processQueuedJob(message);

		expect(mockEnqueueJob).not.toHaveBeenCalled();
		expect(mockUpdateJob).toHaveBeenCalledWith("job-1", {
			status: "failed",
			error: expect.stringContaining("timed out"),
		});
	});

	it("still attempts a job that sat in the queue past the deadline", async () => {
		mockLoadJobForProcessing.mockResolvedValue(
			pendingJob(JOB_TIMEOUT_MS + 60_000),
		);
		const handler = {
			process: vi
				.fn()
				.mockResolvedValue({ kind: "completed", result: { url: "u" } }),
		};
		mockGetJobHandler.mockReturnValue(handler);

		await processQueuedJob(message);

		expect(handler.process).toHaveBeenCalled();
		expect(mockUpdateJob).toHaveBeenLastCalledWith("job-1", {
			status: "completed",
			result: { url: "u" },
		});
	});

	it("marks the job failed and rethrows when the handler errors", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		mockGetJobHandler.mockReturnValue({
			process: vi.fn().mockRejectedValue(new Error("provider down")),
		});

		await expect(processQueuedJob(message)).rejects.toThrow("provider down");
		expect(mockUpdateJob).toHaveBeenNthCalledWith(2, "job-1", {
			status: "failed",
			error: expect.stringContaining("provider down"),
		});
	});
});
