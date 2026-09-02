import { apiJson } from "@/lib/clients/http";
import { sleep } from "@/lib/utils";
import type { RenderHandle, RenderProgress } from "./render-api";
import type { VideoLayout } from "./types";

export type RenderUpdate =
	| { status: "rendering"; progress: number }
	| { status: "done"; url: string; size: number };

const POLL_INTERVAL_MS = 5000;

/**
 * Starts a Lambda render and yields progress until the output is ready.
 * A render that fails upstream throws, so callers handle one error path.
 */
export async function* runRender(
	layout: VideoLayout,
	scale?: number,
): AsyncGenerator<RenderUpdate> {
	const handle = await apiJson<RenderHandle>("/api/render", {
		method: "POST",
		body: { inputProps: layout, scale },
	});
	yield { status: "rendering", progress: 0 };

	for (;;) {
		const result = await apiJson<RenderProgress>("/api/render/progress", {
			method: "POST",
			body: handle,
		});

		if (result.type === "error") throw new Error(result.message);
		if (result.type === "done") {
			yield { status: "done", url: result.url, size: result.size };
			return;
		}

		yield { status: "rendering", progress: result.progress };
		await sleep(POLL_INTERVAL_MS);
	}
}
