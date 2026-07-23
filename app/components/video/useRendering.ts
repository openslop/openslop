"use client";

import { useCallback, useState } from "react";
import { apiJson } from "@/lib/clients/http";
import { errorMessage } from "@/lib/errors";
import type { RenderHandle, RenderProgress } from "@/lib/video/render-api";
import type { VideoLayout } from "@/lib/video/types";

type RenderState =
	| { status: "idle" }
	| { status: "invoking" }
	| ({ status: "rendering"; progress: number } & RenderHandle)
	| { status: "done"; url: string; size: number }
	| { status: "error"; message: string };

const POLL_INTERVAL_MS = 5000;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function useRendering() {
	const [state, setState] = useState<RenderState>({ status: "idle" });

	const render = useCallback(async (layout: VideoLayout, scale?: number) => {
		setState({ status: "invoking" });
		try {
			const handle = await apiJson<RenderHandle>("/api/render", {
				method: "POST",
				body: { inputProps: layout, scale },
			});

			setState({ status: "rendering", ...handle, progress: 0 });

			for (;;) {
				const result = await apiJson<RenderProgress>("/api/render/progress", {
					method: "POST",
					body: handle,
				});

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
					...handle,
					progress: result.progress,
				});
				await wait(POLL_INTERVAL_MS);
			}
		} catch (err) {
			setState({ status: "error", message: errorMessage(err) });
		}
	}, []);

	const reset = useCallback(() => setState({ status: "idle" }), []);

	return { state, render, reset };
}
