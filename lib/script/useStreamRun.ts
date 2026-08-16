"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type StreamRun = {
	loading: boolean;
	/** Aborts the run still in flight, then drains `source` into `onChunk`. */
	run: <T>(
		source: AsyncIterable<T>,
		onChunk: (chunk: T) => void,
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

	const run = useCallback<StreamRun["run"]>(async (source, onChunk) => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setLoading(true);
		try {
			for await (const chunk of source) {
				// The connector takes no signal, so stopping is only observed here.
				if (controller.signal.aborted) return;
				onChunk(chunk);
			}
		} finally {
			if (abortRef.current === controller) {
				abortRef.current = null;
				setLoading(false);
			}
		}
	}, []);

	return useMemo(() => ({ loading, run, stop }), [loading, run, stop]);
}
