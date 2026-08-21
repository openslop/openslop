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
	beforeEach(() => {
		vi.clearAllMocks();
		poll.mockResolvedValue({
			kind: "pending",
			metadata: { status: "processing" },
		});
	});

	it("submits upstream without polling a job it just created", async () => {
		generate.mockResolvedValue({ metadata: { jobId: "upstream-9" } });

		await expect(videoHandler.process(job({ metadata: {} }))).resolves.toEqual({
			kind: "pending",
			metadata: { providerJobId: "upstream-9" },
		});
		expect(generate).toHaveBeenCalledWith({ prompt: "a cat" });
		expect(poll).not.toHaveBeenCalled();
	});

	it("advances the recorded upstream job without resubmitting", async () => {
		await expect(videoHandler.process(job())).resolves.toEqual({
			kind: "pending",
			metadata: { providerJobId: "upstream-1" },
		});
		expect(generate).not.toHaveBeenCalled();
		expect(poll).toHaveBeenCalledWith("upstream-1", { prompt: "a cat" });
	});

	it("throws when the provider returns no job id", async () => {
		generate.mockResolvedValue({ metadata: {} });

		await expect(videoHandler.process(job({ metadata: {} }))).rejects.toThrow(
			"Video provider returned no jobId",
		);
	});

	it("completes with the re-hosted bundle once upstream reports a video", async () => {
		const asset = { ...bundle, result: { video: "output.mp4" } };
		poll.mockResolvedValue({ kind: "ready", asset });

		await expect(videoHandler.process(job())).resolves.toEqual({
			kind: "completed",
			result: asset,
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
