import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AssetQueueMessage } from "@/lib/api/jobs";

vi.mock("@vercel/queue", () => ({
	handleCallback: (fn: unknown) => fn,
}));

const mockLoadJobForProcessing = vi.fn();
const mockUpdateJob = vi.fn();
vi.mock("@/lib/api/jobs", () => ({
	loadJobForProcessing: (...args: unknown[]) =>
		mockLoadJobForProcessing(...args),
	updateJob: (...args: unknown[]) => mockUpdateJob(...args),
}));

const mockGetJobHandler = vi.fn();
vi.mock("@/lib/api/job-handlers", () => ({
	getJobHandler: (...args: unknown[]) => mockGetJobHandler(...args),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const { POST } = await import("@/app/api/queues/asset-generate/route");
// The @vercel/queue mock makes handleCallback return the raw callback
const processMessage = POST as unknown as (
	message: AssetQueueMessage,
) => Promise<void>;

const message: AssetQueueMessage = { jobId: "job-1", connectorType: "image" };

describe("asset-generate queue worker", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUpdateJob.mockResolvedValue(undefined);
	});

	it("skips jobs that already completed", async () => {
		mockLoadJobForProcessing.mockResolvedValue({ status: "completed" });

		await processMessage(message);

		expect(mockGetJobHandler).not.toHaveBeenCalled();
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("skips jobs that already failed", async () => {
		mockLoadJobForProcessing.mockResolvedValue({ status: "failed" });

		await processMessage(message);

		expect(mockGetJobHandler).not.toHaveBeenCalled();
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("throws when no handler is registered for the connector type", async () => {
		mockLoadJobForProcessing.mockResolvedValue({ status: "pending" });
		mockGetJobHandler.mockReturnValue(undefined);

		await expect(processMessage(message)).rejects.toThrow(
			"No job handler registered for image",
		);
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("marks the job processing then completed with the handler result", async () => {
		const job = { status: "pending", id: "job-1" };
		mockLoadJobForProcessing.mockResolvedValue(job);
		const handler = {
			process: vi
				.fn()
				.mockResolvedValue({ kind: "completed", result: { url: "u" } }),
		};
		mockGetJobHandler.mockReturnValue(handler);

		await processMessage(message);

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
		mockLoadJobForProcessing.mockResolvedValue({ status: "pending" });
		mockGetJobHandler.mockReturnValue({
			process: vi
				.fn()
				.mockResolvedValue({ kind: "pending", metadata: { poll: "token" } }),
		});

		await processMessage(message);

		expect(mockUpdateJob).toHaveBeenNthCalledWith(2, "job-1", {
			metadata: { poll: "token" },
		});
	});

	it("marks the job failed and rethrows when the handler errors", async () => {
		mockLoadJobForProcessing.mockResolvedValue({ status: "pending" });
		mockGetJobHandler.mockReturnValue({
			process: vi.fn().mockRejectedValue(new Error("provider down")),
		});

		await expect(processMessage(message)).rejects.toThrow("provider down");
		expect(mockUpdateJob).toHaveBeenNthCalledWith(2, "job-1", {
			status: "failed",
			error: expect.stringContaining("provider down"),
		});
	});
});
