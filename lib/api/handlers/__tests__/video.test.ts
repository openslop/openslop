import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockPoll } = vi.hoisted(() => ({ mockPoll: vi.fn() }));
const mockUpdateJob = vi.fn();

vi.mock("../../providers", () => {
	const noopProvider = () => ({ generate: vi.fn(), poll: vi.fn() });
	return {
		getVideoProvider: () => ({ generate: vi.fn(), poll: mockPoll }),
		getImageProvider: noopProvider,
		getMusicProvider: noopProvider,
		getSFXProvider: noopProvider,
		getTTSProvider: noopProvider,
	};
});
vi.mock("../../jobs", () => ({
	updateJob: (...args: unknown[]) => mockUpdateJob(...args),
}));

import { videoHandler } from "../video";
import type { TypedJobRow } from "../../job-handlers";
import type { VideoGenerateParams } from "@/lib/connectors/types";

function makeJob(
	providerJobId?: string,
): TypedJobRow<VideoGenerateParams, { providerJobId?: string }> {
	return {
		id: "job-1",
		user_id: "u1",
		project_id: null,
		connector_type: "video",
		status: "processing",
		request: { prompt: "test" },
		result: null,
		metadata: { providerJobId },
		error: null,
		created_at: "",
		updated_at: "",
	};
}

describe("videoHandler.poll", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("carries the upstream provider's errorDetail through into the JobPoll result", async () => {
		const errorDetail = { error: { code: "invalidValueUploadFailed" } };
		mockPoll.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: { status: "failed", error: "Upload failed", errorDetail },
		});

		const result = await videoHandler.poll?.(makeJob("provider-job-1"));

		expect(result?.status).toBe("failed");
		expect(result?.error).toBe("Upload failed");
		// toEqual, not toBe: errorDetail is re-serialized (circular-safe) on the way through.
		expect(result?.errorDetail).toEqual(errorDetail);
	});

	it("serializes a circular errorDetail so persisting it can't throw", async () => {
		const errorDetail: Record<string, unknown> = { error: { code: "boom" } };
		errorDetail.self = errorDetail;
		mockPoll.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: { status: "failed", error: "Upload failed", errorDetail },
		});

		const result = await videoHandler.poll?.(makeJob("provider-job-1"));

		// supabase-js JSON.stringifies metadata on write (and the JobPoll result
		// goes through the HTTP response) — a circular errorDetail would throw.
		const persisted = mockUpdateJob.mock.calls[0][1].metadata.errorDetail;
		expect(() => JSON.stringify(persisted)).not.toThrow();
		expect(persisted.error.code).toBe("boom");
		expect(() => JSON.stringify(result?.errorDetail)).not.toThrow();
	});

	it("persists errorDetail into merged metadata (preserving providerJobId) for a later rowView", async () => {
		const errorDetail = { error: { code: "invalidValueUploadFailed" } };
		mockPoll.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: { status: "failed", error: "Upload failed", errorDetail },
		});

		await videoHandler.poll?.(makeJob("provider-job-1"));

		expect(mockUpdateJob).toHaveBeenCalledWith("job-1", {
			status: "failed",
			error: "Upload failed",
			metadata: { providerJobId: "provider-job-1", errorDetail },
		});
	});

	it("leaves errorDetail undefined and does not rewrite metadata when the provider didn't capture one", async () => {
		mockPoll.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: { status: "failed", error: "Video generation failed" },
		});

		const result = await videoHandler.poll?.(makeJob("provider-job-1"));

		expect(result?.status).toBe("failed");
		expect(result?.errorDetail).toBeUndefined();
		// No errorDetail → no metadata write (avoids a pointless rewrite).
		expect(mockUpdateJob).toHaveBeenCalledWith("job-1", {
			status: "failed",
			error: "Video generation failed",
		});
	});
});
