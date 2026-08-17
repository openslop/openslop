import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { TypedJobRow } from "@/lib/api/job-handlers";
import { videoHandler } from "../video";

const generate = vi.fn();
const poll = vi.fn();

vi.mock("@/lib/api/providers", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/lib/api/providers")>()),
	getVideoProvider: () => ({ generate, poll }),
}));

type VideoJobRow = TypedJobRow<
	VideoGenerateParams,
	{ providerJobId?: string; durationSec?: number }
>;

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
		metadata: { providerJobId: "upstream-1", durationSec: 8 },
		error: null,
		created_at: "2026-01-01T00:00:00Z",
		updated_at: "2026-01-01T00:00:00Z",
		...overrides,
	};
}

describe("videoHandler.process", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		poll.mockResolvedValue({
			kind: "pending",
			metadata: { status: "processing" },
		});
	});

	it("submits upstream without polling a job it just created", async () => {
		generate.mockResolvedValue({
			metadata: { jobId: "upstream-9", durationSec: 10 },
		});

		await expect(videoHandler.process(job({ metadata: {} }))).resolves.toEqual({
			kind: "pending",
			metadata: { providerJobId: "upstream-9", durationSec: 10 },
		});
		expect(generate).toHaveBeenCalledWith({ prompt: "a cat" });
		expect(poll).not.toHaveBeenCalled();
	});

	it("advances the recorded upstream job without resubmitting", async () => {
		await expect(videoHandler.process(job())).resolves.toEqual({
			kind: "pending",
			metadata: { providerJobId: "upstream-1", durationSec: 8 },
		});
		expect(generate).not.toHaveBeenCalled();
		expect(poll).toHaveBeenCalledWith("upstream-1");
	});

	it("throws when the provider returns no job id", async () => {
		generate.mockResolvedValue({ metadata: { durationSec: 10 } });

		await expect(videoHandler.process(job({ metadata: {} }))).rejects.toThrow(
			"unusable submission",
		);
	});

	it("throws when the provider returns no duration", async () => {
		generate.mockResolvedValue({ metadata: { jobId: "upstream-9" } });

		await expect(videoHandler.process(job({ metadata: {} }))).rejects.toThrow(
			"unusable submission",
		);
	});

	it("completes with the re-hosted bundle once upstream reports a video", async () => {
		const asset = { ...bundle, result: { video: "output.mp4" } };
		poll.mockResolvedValue({ kind: "ready", asset });

		await expect(videoHandler.process(job())).resolves.toEqual({
			kind: "completed",
			result: { ...asset, metadata: { durationSec: 8 } },
		});
	});

	// The upstream poll is keyed by job id alone and reports no duration, so
	// without the submission's duration the finished video lays out as one second.
	it("stamps the submitted duration onto the finished asset", async () => {
		poll.mockResolvedValue({
			kind: "ready",
			asset: {
				...bundle,
				result: { video: "output.mp4" },
				metadata: { jobId: "upstream-1", status: "completed" },
			},
		});

		const outcome = await videoHandler.process(job());

		expect(outcome).toMatchObject({
			kind: "completed",
			result: {
				metadata: { jobId: "upstream-1", status: "completed", durationSec: 8 },
			},
		});
	});

	it("throws the upstream error message on failure", async () => {
		poll.mockResolvedValue({
			kind: "pending",
			metadata: { status: "failed", error: "content policy" },
		});

		await expect(videoHandler.process(job())).rejects.toThrow("content policy");
	});

	it("throws a fallback message when upstream fails without one", async () => {
		poll.mockResolvedValue({ kind: "pending", metadata: { status: "failed" } });

		await expect(videoHandler.process(job())).rejects.toThrow(
			"Video generation failed",
		);
	});
});
