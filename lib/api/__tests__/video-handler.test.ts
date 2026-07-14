import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { JobRow } from "../jobs";
import { videoHandler } from "../handlers/video";

const mockGenerate = vi.fn();
const mockPoll = vi.fn();
const mockUpdateJob = vi.fn();

vi.mock("../providers", async (importOriginal) => ({
	...(await importOriginal<typeof import("../providers")>()),
	getVideoProvider: () => ({ generate: mockGenerate, poll: mockPoll }),
}));
vi.mock("../jobs", () => ({
	updateJob: (...args: unknown[]) => mockUpdateJob(...args),
}));

type VideoJobRow = Omit<JobRow, "request" | "metadata"> & {
	request: VideoGenerateParams;
	metadata: { providerJobId?: string; durationSec?: number };
};

function makeJob(overrides: Partial<VideoJobRow> = {}): VideoJobRow {
	return {
		id: "job-1",
		user_id: "user-1",
		project_id: null,
		connector_type: "video",
		status: "processing",
		request: { prompt: "a sunset", duration: 8 },
		result: null,
		metadata: { providerJobId: "provider-1", durationSec: 8 },
		error: null,
		created_at: "",
		updated_at: "",
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("videoHandler.process", () => {
	it("keeps the submitted duration in metadata so poll can restore it", async () => {
		mockGenerate.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: { jobId: "provider-1", durationSec: 8 },
		});

		const outcome = await videoHandler.process(makeJob());

		expect(outcome).toEqual({
			kind: "pending",
			metadata: { providerJobId: "provider-1", durationSec: 8 },
		});
	});

	it("throws when the provider returns no jobId", async () => {
		mockGenerate.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: {},
		});

		await expect(videoHandler.process(makeJob())).rejects.toThrow(
			"Video provider returned no jobId",
		);
	});
});

describe("videoHandler.poll", () => {
	it("returns the stored row for a completed job without re-polling upstream", async () => {
		const result = {
			id: "bundle-1",
			provider: "runware",
			result: { video: "https://v.mp4" },
		};
		const view = await videoHandler.poll?.(
			makeJob({ status: "completed", result }),
		);

		expect(view).toEqual({
			jobId: "job-1",
			status: "completed",
			result,
			error: null,
		});
		expect(mockPoll).not.toHaveBeenCalled();
		expect(mockUpdateJob).not.toHaveBeenCalled();
	});

	it("returns the stored row for a failed job without re-polling upstream", async () => {
		const view = await videoHandler.poll?.(
			makeJob({ status: "failed", error: "boom" }),
		);

		expect(view).toMatchObject({ status: "failed", error: "boom" });
		expect(mockPoll).not.toHaveBeenCalled();
	});

	it("passes the submitted duration to the provider and persists the result", async () => {
		const upstream = {
			id: "bundle-1",
			provider: "runware",
			result: { video: "https://v.mp4" },
			metadata: { jobId: "provider-1", durationSec: 8 },
		};
		mockPoll.mockResolvedValue(upstream);

		const view = await videoHandler.poll?.(makeJob());

		expect(mockPoll).toHaveBeenCalledWith("provider-1", 8);
		expect(mockUpdateJob).toHaveBeenCalledWith("job-1", {
			status: "completed",
			result: upstream,
		});
		expect(view).toEqual({
			jobId: "job-1",
			status: "completed",
			result: upstream,
			error: null,
		});
	});

	it("marks the job failed when the provider reports failure", async () => {
		mockPoll.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: { jobId: "provider-1", status: "failed", error: "no credits" },
		});

		const view = await videoHandler.poll?.(makeJob());

		expect(mockUpdateJob).toHaveBeenCalledWith("job-1", {
			status: "failed",
			error: "no credits",
		});
		expect(view).toMatchObject({ status: "failed", error: "no credits" });
	});

	it("stays pending while the provider has no video yet", async () => {
		mockPoll.mockResolvedValue({
			id: "",
			provider: "runware",
			result: {},
			metadata: { jobId: "provider-1", status: "processing" },
		});

		const view = await videoHandler.poll?.(makeJob());

		expect(mockUpdateJob).not.toHaveBeenCalled();
		expect(view).toEqual({
			jobId: "job-1",
			status: "processing",
			result: null,
			error: null,
		});
	});

	it("falls back to the stored row when no provider job was recorded", async () => {
		const view = await videoHandler.poll?.(makeJob({ metadata: {} }));

		expect(mockPoll).not.toHaveBeenCalled();
		expect(view).toMatchObject({ jobId: "job-1", status: "processing" });
	});
});
