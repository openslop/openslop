import { afterEach, describe, expect, it, vi } from "vitest";

const mockSend = vi.fn();
vi.mock("@vercel/queue", () => ({
	send: (...args: unknown[]) => mockSend(...args),
}));

const mockEnqueueLocal = vi.fn();
vi.mock("@/lib/api/local-queue", () => ({
	enqueueLocal: (...args: unknown[]) => mockEnqueueLocal(...args),
}));

const { enqueueJob } = await import("@/lib/api/job-queue");

const JOB_ID = "job-1";

describe("enqueueJob", () => {
	afterEach(() => vi.unstubAllEnvs());

	it("sends the job to the hosted queue", async () => {
		await enqueueJob(JOB_ID, { delaySeconds: 5 });

		expect(mockSend).toHaveBeenCalledExactlyOnceWith(
			"asset-generate",
			{ jobId: JOB_ID },
			{ delaySeconds: 5 },
		);
		expect(mockEnqueueLocal).not.toHaveBeenCalled();
	});

	it("runs the job in process in local mode", async () => {
		vi.stubEnv("NEXT_PUBLIC_OPENSLOP_LOCAL", "1");

		await enqueueJob(JOB_ID, { delaySeconds: 5 });

		expect(mockEnqueueLocal).toHaveBeenCalledExactlyOnceWith(JOB_ID, {
			delaySeconds: 5,
		});
		expect(mockSend).not.toHaveBeenCalled();
	});
});
