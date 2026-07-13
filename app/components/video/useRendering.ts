"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const wait = (ms: number, signal: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		const timer = setTimeout(resolve, ms);
		signal.addEventListener(
			"abort",
			() => {
				clearTimeout(timer);
				reject(signal.reason);
			},
			{ once: true },
		);
	});

async function postJSON<T>(
	url: string,
	body: unknown,
	signal: AbortSignal,
): Promise<T> {
	const res = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
		signal,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json() as Promise<T>;
}

export function useRendering() {
	const [state, setState] = useState<RenderState>({ status: "idle" });
	const abortRef = useRef<AbortController | null>(null);

	const abort = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
	}, []);

	useEffect(() => abort, [abort]);

	const render = useCallback(
		async (layout: VideoLayout, scale?: number) => {
			abort();
			const controller = new AbortController();
			abortRef.current = controller;
			const { signal } = controller;

			setState({ status: "invoking" });
			try {
				const { renderId, bucketName } = await postJSON<{
					renderId: string;
					bucketName: string;
				}>("/api/render", { inputProps: layout, scale }, signal);

				setState({ status: "rendering", renderId, bucketName, progress: 0 });

				for (;;) {
					const result = await postJSON<ProgressResponse>(
						"/api/render/progress",
						{ renderId, bucketName },
						signal,
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
					await wait(POLL_INTERVAL_MS, signal);
				}
			} catch (err) {
				if (signal.aborted) return;
				setState({ status: "error", message: stringifyError(err) });
			}
		},
		[abort],
	);

	const reset = useCallback(() => {
		abort();
		setState({ status: "idle" });
	}, [abort]);

	return { state, render, reset };
}
