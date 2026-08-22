import { describe, expect, it } from "vitest";
import { parseAssetQueueCallback } from "@/lib/api/queue-callback";

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
