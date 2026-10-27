import { apiJson } from "@/lib/clients/http";
import { pollUpdates } from "@/lib/providers/poll";
import { RenderHandle, RenderProgress } from "./render-api";
import type { Resolution } from "./resolutions";
import type { RenderLayout } from "./types";

export type RenderUpdate =
	| { status: "rendering"; progress: number }
	| { status: "done"; url: string; size: number };

/**
 * Starts a Lambda render and yields progress until the output is ready.
 * A render that fails upstream throws, so callers handle one error path.
 */
export async function* runRender(
	layout: RenderLayout,
	resolution: Resolution,
): AsyncGenerator<RenderUpdate> {
	const handle = await apiJson("/api/render", RenderHandle, {
		method: "POST",
		body: { inputProps: layout, resolution },
	});
	yield { status: "rendering", progress: 0 };

	const progress = () =>
		apiJson("/api/render/progress", RenderProgress, {
			method: "POST",
			body: handle,
		});
	for await (const result of pollUpdates(progress)) {
		if (result.type === "error") throw new Error(result.message);
		if (result.type === "done") {
			yield { status: "done", url: result.url, size: result.size };
			return;
		}
		yield { status: "rendering", progress: result.progress };
	}
}
