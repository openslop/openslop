"use client";

import { useCallback, useState } from "react";
import type { ProgressResponse } from "@/app/api/render/progress/route";
import { stringifyError } from "@/lib/errors";
import type { VideoLayout } from "@/lib/video/types";

type RenderState =
	| { status: "idle" }
	| { status: "invoking" }
	| {
			status: "rendering";
			renderId: string;
			bucketName: string;
			progress: number;
	  }
	| { status: "done"; url: string; size: number }
	| { status: "error"; message: string };

const POLL_INTERVAL_MS = 5000;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function postJSON<T>(url: string, body: unknown): Promise<T> {
	const res = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json() as Promise<T>;
}

export function useRendering() {
	const [state, setState] = useState<RenderState>({ status: "idle" });

	const render = useCallback(async (layout: VideoLayout, scale?: number) => {
		setState({ status: "invoking" });
		try {
			const { renderId, bucketName } = await postJSON<{
				renderId: string;
				bucketName: string;
			}>("/api/render", { inputProps: layout, scale });

			setState({ status: "rendering", renderId, bucketName, progress: 0 });

			for (;;) {
				const result = await postJSON<ProgressResponse>(
					"/api/render/progress",
					{ renderId, bucketName },
				);

				if (result.type === "error") {
					setState({ status: "error", message: result.message });
					return;
				}
				if (result.type === "done") {
					setState({ status: "done", url: result.url, size: result.size });
					return;
				}
				setState({
					status: "rendering",
					renderId,
					bucketName,
					progress: result.progress,
				});
				await wait(POLL_INTERVAL_MS);
			}
		} catch (err) {
			setState({ status: "error", message: stringifyError(err) });
		}
	}, []);

	const reset = useCallback(() => setState({ status: "idle" }), []);

	return { state, render, reset };
}
