import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MessageMetadata } from "@vercel/queue";
import { logger } from "@/lib/api/logger";
import {
	parseAssetQueueCallback,
	retryWithBackoff,
} from "@/lib/api/queue-callback";

vi.mock("@/lib/api/logger", () => ({ logger: { error: vi.fn() } }));

const JOB_ID = "1f5b0d1e-6c4a-4f0e-9a2b-8e7c3d5a1b90";

describe("parseAssetQueueCallback", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the job id from a well-formed message", () => {
		expect(parseAssetQueueCallback({ jobId: JOB_ID })).toBe(JOB_ID);
		expect(logger.error).not.toHaveBeenCalled();
	});

	it("ignores extra fields a caller attaches to the message", () => {
		expect(
			parseAssetQueueCallback({ jobId: JOB_ID, connectorType: "video" }),
		).toBe(JOB_ID);
	});

	it.each([
		undefined,
		null,
		"",
		{},
		{ jobId: "" },
		{ jobId: "not-a-uuid" },
		{ jobId: { toString: (): string => JOB_ID } },
		{ jobId: [JOB_ID] },
	])("drops %o and logs the reason", (message) => {
		expect(parseAssetQueueCallback(message)).toBeUndefined();
		expect(logger.error).toHaveBeenCalledOnce();
	});
});

describe("retryWithBackoff", () => {
	const delivery = (deliveryCount: number) =>
		({ deliveryCount }) as MessageMetadata;

	it.each([
		[1, 10],
		[2, 20],
		[5, 160],
		[6, 300],
		[40, 300],
	])("delivery %i is retried after %i seconds", (deliveryCount, seconds) => {
		expect(
			retryWithBackoff(new Error("db down"), delivery(deliveryCount)),
		).toEqual({ afterSeconds: seconds });
	});
});
