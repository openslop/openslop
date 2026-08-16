"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { drainStream } from "./drainStream";

export type StreamRun = {
	loading: boolean;
	/**
	 * Aborts the run still in flight, then drains `source` into `onChunk`.
	 * Resolves true only when the stream ended on its own, so a superseded run
	 * can tell that it is no longer the one whose result counts.
	 */
	run: <T>(
		source: AsyncIterable<T>,
		onChunk: (chunk: T) => void,
	) => Promise<boolean>;
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

	const run = useCallback<StreamRun["run"]>(async (source, onChunk) => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setLoading(true);
		try {
			return await drainStream(source, controller.signal, onChunk);
		} finally {
			if (abortRef.current === controller) {
				abortRef.current = null;
				setLoading(false);
			}
		}
	}, []);

	return useMemo(() => ({ loading, run, stop }), [loading, run, stop]);
}
