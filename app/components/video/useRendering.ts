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
		if (signal.aborted) {
			reject(new DOMException("Aborted", "AbortError"));
			return;
		}
		const id = setTimeout(() => {
			signal.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		const onAbort = () => {
			clearTimeout(id);
			reject(new DOMException("Aborted", "AbortError"));
		};
		signal.addEventListener("abort", onAbort, { once: true });
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
	const controllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		return () => controllerRef.current?.abort();
	}, []);

	const render = useCallback(async (layout: VideoLayout) => {
		controllerRef.current?.abort();
		const controller = new AbortController();
		controllerRef.current = controller;
		const { signal } = controller;

		setState({ status: "invoking" });
		try {
			const { renderId, bucketName } = await postJSON<{
				renderId: string;
				bucketName: string;
			}>("/api/render", { inputProps: layout }, signal);

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
	}, []);

	const reset = useCallback(() => {
		controllerRef.current?.abort();
		controllerRef.current = null;
		setState({ status: "idle" });
	}, []);

	return { state, render, reset };
}
