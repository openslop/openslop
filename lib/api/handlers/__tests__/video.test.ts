import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { TypedJobRow } from "../../job-handlers";
import { videoHandler } from "../video";

const generate = vi.fn();
const poll = vi.fn();
const updateJob = vi.fn();

vi.mock("../../providers", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../providers")>()),
	getVideoProvider: () => ({ generate, poll }),
}));
vi.mock("../../jobs", () => ({
	updateJob: (...args: unknown[]) => updateJob(...args),
}));

type VideoJobRow = TypedJobRow<VideoGenerateParams, { providerJobId?: string }>;

const bundle = { id: "bundle-1" } as unknown as BundleResponse;

function job(overrides: Partial<VideoJobRow> = {}): VideoJobRow {
	return {
		id: "job-1",
		user_id: "user-1",
		project_id: null,
		connector_type: "video",
		status: "processing",
		request: { prompt: "a cat" } as VideoGenerateParams,
		result: null,
		metadata: { providerJobId: "upstream-1" },
		error: null,
		created_at: "2026-01-01T00:00:00Z",
		updated_at: "2026-01-01T00:00:00Z",
		...overrides,
	};
}

describe("videoHandler.process", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns the provider job id as pending metadata", async () => {
		generate.mockResolvedValue({ metadata: { jobId: "upstream-9" } });

		await expect(videoHandler.process(job())).resolves.toEqual({
			kind: "pending",
			metadata: { providerJobId: "upstream-9" },
		});
	});

	it("throws when the provider returns no job id", async () => {
		generate.mockResolvedValue({ metadata: {} });

		await expect(videoHandler.process(job())).rejects.toThrow(
			"Video provider returned no jobId",
		);
	});
});

describe("videoHandler.poll", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns the stored row for completed jobs without re-polling upstream", async () => {
		const row = job({ status: "completed", result: bundle });

		await expect(videoHandler.poll?.(row)).resolves.toEqual({
			jobId: "job-1",
			status: "completed",
			result: bundle,
			error: null,
		});
		expect(poll).not.toHaveBeenCalled();
		expect(updateJob).not.toHaveBeenCalled();
	});

	it("returns the stored row for failed jobs without re-polling upstream", async () => {
		const row = job({ status: "failed", error: "upstream exploded" });

		await expect(videoHandler.poll?.(row)).resolves.toEqual({
			jobId: "job-1",
			status: "failed",
			result: null,
			error: "upstream exploded",
		});
		expect(poll).not.toHaveBeenCalled();
		expect(updateJob).not.toHaveBeenCalled();
	});

	it("returns the stored row when no provider job id was recorded", async () => {
		const row = job({ metadata: {} });

		await expect(videoHandler.poll?.(row)).resolves.toEqual({
			jobId: "job-1",
			status: "processing",
			result: null,
			error: null,
		});
		expect(poll).not.toHaveBeenCalled();
	});

	it("persists the bundle once upstream reports a video", async () => {
		poll.mockResolvedValue({ ...bundle, result: { video: "v.mp4" } });

		await expect(videoHandler.poll?.(job())).resolves.toEqual({
			jobId: "job-1",
			status: "completed",
			result: { ...bundle, result: { video: "v.mp4" } },
			error: null,
		});
		expect(updateJob).toHaveBeenCalledWith("job-1", {
			status: "completed",
			result: { ...bundle, result: { video: "v.mp4" } },
		});
	});

	it("persists the upstream error message on failure", async () => {
		poll.mockResolvedValue({
			result: {},
			metadata: { status: "failed", error: "content policy" },
		});

		await expect(videoHandler.poll?.(job())).resolves.toEqual({
			jobId: "job-1",
			status: "failed",
			result: null,
			error: "content policy",
		});
		expect(updateJob).toHaveBeenCalledWith("job-1", {
			status: "failed",
			error: "content policy",
		});
	});

	it("stays processing without writing when upstream is still working", async () => {
		poll.mockResolvedValue({ result: {}, metadata: { status: "processing" } });

		await expect(videoHandler.poll?.(job())).resolves.toEqual({
			jobId: "job-1",
			status: "processing",
			result: null,
			error: null,
		});
		expect(updateJob).not.toHaveBeenCalled();
	});
});
