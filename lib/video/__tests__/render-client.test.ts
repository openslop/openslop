import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "@/lib/clients/http";
import type { VideoLayout } from "../types";
import { runRender, type RenderUpdate } from "../render-client";

vi.mock("@/lib/clients/http", () => ({ apiJson: vi.fn() }));

const apiJsonMock = vi.mocked(apiJson);

const LAYOUT = { series: [] } as unknown as VideoLayout;
const HANDLE = { renderId: "r1", bucketName: "b1" };

/** Drains the generator while letting the poll delay elapse between yields. */
async function collect(
	updates: AsyncGenerator<RenderUpdate>,
): Promise<RenderUpdate[]> {
	const seen: RenderUpdate[] = [];
	const settled = (async () => {
		for await (const update of updates) seen.push(update);
	})().then(
		() => null,
		(err: unknown) => err,
	);
	await vi.runAllTimersAsync();
	const failure = await settled;
	if (failure) throw failure;
	return seen;
}

beforeEach(() => {
	vi.useFakeTimers();
	apiJsonMock.mockReset();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("runRender", () => {
	it("submits the layout, then polls until the output is ready", async () => {
		apiJsonMock
			.mockResolvedValueOnce(HANDLE)
			.mockResolvedValueOnce({ type: "progress", progress: 0.4 })
			.mockResolvedValueOnce({ type: "done", url: "/out.mp4", size: 1024 });

		const seen = await collect(runRender(LAYOUT, 0.5));

		expect(seen).toEqual([
			{ status: "rendering", progress: 0 },
			{ status: "rendering", progress: 0.4 },
			{ status: "done", url: "/out.mp4", size: 1024 },
		]);
		expect(apiJsonMock).toHaveBeenNthCalledWith(1, "/api/render", {
			method: "POST",
			body: { inputProps: LAYOUT, scale: 0.5 },
		});
		expect(apiJsonMock).toHaveBeenNthCalledWith(2, "/api/render/progress", {
			method: "POST",
			body: HANDLE,
		});
	});

	it("stops polling once the render is done", async () => {
		apiJsonMock
			.mockResolvedValueOnce(HANDLE)
			.mockResolvedValueOnce({ type: "done", url: "/out.mp4", size: 1 });

		await collect(runRender(LAYOUT));

		expect(apiJsonMock).toHaveBeenCalledTimes(2);
	});

	it("throws the upstream message when the render fails", async () => {
		apiJsonMock
			.mockResolvedValueOnce(HANDLE)
			.mockResolvedValueOnce({ type: "error", message: "Render failed" });

		await expect(collect(runRender(LAYOUT))).rejects.toThrow("Render failed");
	});

	it("propagates a failure to start the render", async () => {
		apiJsonMock.mockRejectedValueOnce(new Error("Unauthorized"));

		await expect(collect(runRender(LAYOUT))).rejects.toThrow("Unauthorized");
	});
});
