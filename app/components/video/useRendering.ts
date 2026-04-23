"use client";

import { useCallback, useState } from "react";
import { readSSE, type SSEMessage } from "@/lib/api/sse";
import type { VideoLayout } from "@/lib/video/types";

type RenderState =
	| { status: "idle" }
	| { status: "rendering"; phase: string; progress: number }
	| { status: "done"; url: string; size: number }
	| { status: "error"; message: string };

export function useRendering() {
	const [state, setState] = useState<RenderState>({ status: "idle" });

	const render = useCallback(async (layout: VideoLayout) => {
		setState({ status: "rendering", phase: "Starting...", progress: 0 });

		try {
			const response = await fetch("/api/render", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ inputProps: layout }),
			});

			if (!response.ok || !response.body) {
				throw new Error("Failed to start render");
			}

			for await (const message of readSSE<SSEMessage>(response.body)) {
				switch (message.type) {
					case "phase":
						setState({
							status: "rendering",
							phase: message.phase,
							progress: message.progress,
						});
						break;
					case "done":
						setState({
							status: "done",
							url: message.url,
							size: message.size,
						});
						break;
					case "error":
						setState({ status: "error", message: message.message });
						break;
				}
			}
		} catch (err) {
			setState({
				status: "error",
				message: err instanceof Error ? err.message : "Render failed",
			});
		}
	}, []);

	const reset = useCallback(() => setState({ status: "idle" }), []);

	return { state, render, reset };
}
