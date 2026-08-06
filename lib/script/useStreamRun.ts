"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { drainStream } from "./drainStream";

export type StreamRun = {
	loading: boolean;
	/**
	 * Aborts the run still in flight, then drains `source` into `onChunk`.
	 * `onSettled` runs only when the stream finishes without being aborted.
	 */
	run: <T>(
		source: AsyncIterable<T>,
		onChunk: (chunk: T) => void,
		onSettled?: () => void,
	) => Promise<void>;
	stop: () => void;
};

/**
 * Owns the lifecycle of a single at-a-time streamed run: at most one in flight,
 * and a `loading` flag only the current run may clear, so a superseded run can't
 * report the newer one as finished.
 */
export function useStreamRun(): StreamRun {
	const [loading, setLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	const stop = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setLoading(false);
	}, []);

	const run = useCallback<StreamRun["run"]>(
		async (source, onChunk, onSettled) => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;
			setLoading(true);
			try {
				await drainStream(source, controller.signal, onChunk, onSettled);
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
					setLoading(false);
				}
			}
		},
		[],
	);

	return useMemo(() => ({ loading, run, stop }), [loading, run, stop]);
}
