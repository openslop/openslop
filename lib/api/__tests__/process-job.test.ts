import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChargedError } from "@/lib/providers/base";

const mockLoadJobForProcessing = vi.fn();
const mockClaimJob = vi.fn();
const mockUpdateJob = vi.fn();
const mockEnqueueJob = vi.fn();
vi.mock("@/lib/api/jobs", () => ({
	loadJobForProcessing: (...args: unknown[]) =>
		mockLoadJobForProcessing(...args),
	claimJob: (...args: unknown[]) => mockClaimJob(...args),
	updateJob: (...args: unknown[]) => mockUpdateJob(...args),
	enqueueJob: (...args: unknown[]) => mockEnqueueJob(...args),
}));

const mockGetJobHandler = vi.fn();
vi.mock("@/lib/api/job-handlers", () => ({
	getJobHandler: (...args: unknown[]) => mockGetJobHandler(...args),
}));

const logger = vi.hoisted(() => ({ error: vi.fn(), warn: vi.fn() }));
vi.mock("@/lib/api/logger", () => ({ logger }));

const { processQueuedJob } = await import("@/lib/api/process-job");

const JOB_ID = "job-1";

function stubPendingHandler(metadata: Record<string, unknown> = {}) {
	const handler = {
		process: vi.fn().mockResolvedValue({ kind: "pending", metadata }),
	};
	mockGetJobHandler.mockReturnValue(handler);
	return handler;
}

function stubCompletedHandler() {
	const handler = {
		process: vi.fn().mockResolvedValue({ kind: "completed", result: {} }),
	};
	mockGetJobHandler.mockReturnValue(handler);
	return handler;
}

function pendingJob(ageMs = 0) {
	return {
		status: "pending",
		id: JOB_ID,
		connector_type: "image",
		metadata: {},
		created_at: new Date(Date.now() - ageMs).toISOString(),
	};
}

describe("processQueuedJob", () => {
	beforeEach(() => {
		mockClaimJob.mockResolvedValue(true);
		mockUpdateJob.mockResolvedValue(undefined);
		mockEnqueueJob.mockResolvedValue(undefined);
	});

	it.each(["completed", "failed"])(
		"skips a job that already %s",
		async (status) => {
			mockLoadJobForProcessing.mockResolvedValue({ status });

			await processQueuedJob(JOB_ID);

			expect(mockClaimJob).not.toHaveBeenCalled();
			expect(mockGetJobHandler).not.toHaveBeenCalled();
			expect(mockUpdateJob).not.toHaveBeenCalled();
		},
	);

	it("acknowledges a message whose job does not exist", async () => {
		mockLoadJobForProcessing.mockResolvedValue(null);

		await expect(processQueuedJob(JOB_ID)).resolves.toBeUndefined();

		expect(mockClaimJob).not.toHaveBeenCalled();
		expect(mockGetJobHandler).not.toHaveBeenCalled();
		expect(mockEnqueueJob).not.toHaveBeenCalled();
	});

	it.each(["pending", "processing"])(
		"fails a %s job past the deadline without running it again",
		async (status) => {
			mockLoadJobForProcessing.mockResolvedValue({
				...pendingJob(60 * 60_000),
				status,
			});
			const handler = { process: vi.fn() };
			mockGetJobHandler.mockReturnValue(handler);

			await processQueuedJob(JOB_ID);

			expect(handler.process).not.toHaveBeenCalled();
			expect(mockEnqueueJob).not.toHaveBeenCalled();
			expect(mockUpdateJob).toHaveBeenCalledExactlyOnceWith(JOB_ID, {
				status: "failed",
				error: expect.stringContaining("timed out"),
			});
		},
	);

	describe("claiming", () => {
		it("claims the job, runs the handler and stores the result with its cost", async () => {
			const job = pendingJob();
			mockLoadJobForProcessing.mockResolvedValue(job);
			const handler = {
				process: vi.fn().mockResolvedValue({
					kind: "completed",
					result: { url: "u" },
					costUsd: 0.18,
				}),
			};
			mockGetJobHandler.mockReturnValue(handler);

			await processQueuedJob(JOB_ID);

			expect(mockClaimJob).toHaveBeenCalledExactlyOnceWith(JOB_ID);
			expect(handler.process).toHaveBeenCalledWith(job);
			expect(mockUpdateJob).toHaveBeenCalledExactlyOnceWith(JOB_ID, {
				status: "completed",
				result: { url: "u" },
				cost_usd: 0.18,
			});
			expect(mockEnqueueJob).not.toHaveBeenCalled();
		});

		it("runs the handler once when two deliveries of one job race", async () => {
			mockLoadJobForProcessing.mockResolvedValue(pendingJob());
			mockClaimJob.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
			const handler = stubCompletedHandler();

			const outcomes = await Promise.allSettled([
				processQueuedJob(JOB_ID),
				processQueuedJob(JOB_ID),
			]);

			expect(handler.process).toHaveBeenCalledTimes(1);
			expect(outcomes.map((o) => o.status).sort()).toEqual([
				"fulfilled",
				"rejected",
			]);
		});

		it("throws without running the handler when another delivery holds the job", async () => {
			mockLoadJobForProcessing.mockResolvedValue({
				...pendingJob(),
				status: "processing",
			});
			const handler = stubCompletedHandler();

			await expect(processQueuedJob(JOB_ID)).rejects.toThrow(
				"held by another delivery",
			);

			expect(mockClaimJob).not.toHaveBeenCalled();
			expect(handler.process).not.toHaveBeenCalled();
			expect(mockUpdateJob).not.toHaveBeenCalled();
		});

		it("throws without running the handler when the claim is lost", async () => {
			mockLoadJobForProcessing.mockResolvedValue(pendingJob());
			mockClaimJob.mockResolvedValue(false);
			const handler = stubCompletedHandler();

			await expect(processQueuedJob(JOB_ID)).rejects.toThrow(
				"held by another delivery",
			);

			expect(handler.process).not.toHaveBeenCalled();
			expect(mockUpdateJob).not.toHaveBeenCalled();
		});
	});

	describe("pending outcomes", () => {
		it("checkpoints the metadata, releases the job and redelivers it after a delay", async () => {
			mockLoadJobForProcessing.mockResolvedValue(pendingJob());
			stubPendingHandler({ providerJobId: "upstream-1" });

			await processQueuedJob(JOB_ID);

			expect(mockUpdateJob).toHaveBeenCalledExactlyOnceWith(JOB_ID, {
				status: "pending",
				metadata: { providerJobId: "upstream-1" },
			});
			expect(mockEnqueueJob).toHaveBeenCalledWith(JOB_ID, {
				delaySeconds: expect.any(Number),
			});
			expect(mockUpdateJob.mock.invocationCallOrder[0]).toBeLessThan(
				mockEnqueueJob.mock.invocationCallOrder[0],
			);
		});

		it("propagates a redelivery failure so the queue retries instead of failing the job", async () => {
			mockLoadJobForProcessing.mockResolvedValue(pendingJob());
			stubPendingHandler();
			mockEnqueueJob.mockRejectedValue(new Error("queue unavailable"));

			await expect(processQueuedJob(JOB_ID)).rejects.toThrow(
				"queue unavailable",
			);
			expect(mockUpdateJob).not.toHaveBeenCalledWith(
				JOB_ID,
				expect.objectContaining({ status: "failed" }),
			);
		});
	});

	it("fails the job with the provider's reason on the first error, and logs the whole error", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		const failure = new Error("provider down");
		mockGetJobHandler.mockReturnValue({
			process: vi.fn().mockRejectedValue(failure),
		});

		await expect(processQueuedJob(JOB_ID)).rejects.toBe(failure);

		expect(logger.error).toHaveBeenCalledWith(failure, expect.any(String));
		expect(mockUpdateJob).toHaveBeenCalledExactlyOnceWith(JOB_ID, {
			status: "failed",
			error: "provider down",
		});
		expect(mockEnqueueJob).not.toHaveBeenCalled();
	});

	it("books the vendor's charge on a job that failed after the vendor was paid", async () => {
		mockLoadJobForProcessing.mockResolvedValue(pendingJob());
		const failure = new ChargedError(0.18, new Error("blob unavailable"));
		mockGetJobHandler.mockReturnValue({
			process: vi.fn().mockRejectedValue(failure),
		});

		await expect(processQueuedJob(JOB_ID)).rejects.toBe(failure);

		expect(mockUpdateJob).toHaveBeenCalledExactlyOnceWith(JOB_ID, {
			status: "failed",
			error: "blob unavailable",
			cost_usd: 0.18,
		});
	});

	it("picks the handler from the job row's connector type", async () => {
		mockLoadJobForProcessing.mockResolvedValue({
			...pendingJob(),
			connector_type: "tts",
		});
		stubPendingHandler();

		await processQueuedJob(JOB_ID);

		expect(mockGetJobHandler).toHaveBeenCalledWith("tts");
	});
});
