import { describe, expect, it, vi } from "vitest";
import type { MessageMetadata } from "@vercel/queue";
import {
	parseAssetQueueCallback,
	retryWithBackoff,
} from "@/lib/api/queue-callback";

const mockLogError = vi.fn();
vi.mock("@/lib/api/logger", () => ({
	logger: { error: (...args: unknown[]) => mockLogError(...args) },
}));

const JOB_ID = "1f5b0d1e-6c4a-4f0e-9a2b-8e7c3d5a1b90";

describe("parseAssetQueueCallback", () => {
	it("returns the job id from a well-formed message", () => {
		expect(parseAssetQueueCallback({ jobId: JOB_ID })).toBe(JOB_ID);
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
	])("rejects %o", (message) => {
		expect(() => parseAssetQueueCallback(message)).toThrow(
			"Rejected asset queue callback: malformed message",
		);
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
		[14, 300],
	])("delivery %i is retried after %i seconds", (deliveryCount, seconds) => {
		expect(
			retryWithBackoff(new Error("db down"), delivery(deliveryCount)),
		).toEqual({ afterSeconds: seconds });
		expect(mockLogError).not.toHaveBeenCalled();
	});

	it.each([15, 16, 40])(
		"delivery %i is acknowledged and its error logged",
		(deliveryCount) => {
			const error = new Error("db down");

			expect(retryWithBackoff(error, delivery(deliveryCount))).toEqual({
				acknowledge: true,
			});
			expect(mockLogError).toHaveBeenCalledWith(
				error,
				`Dropped a queue message after ${deliveryCount} deliveries`,
			);
		},
	);
});
