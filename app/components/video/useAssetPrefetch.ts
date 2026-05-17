import { useEffect, useRef, useState } from "react";
import type { prefetch as PrefetchFn } from "remotion";
import type { VideoLayout } from "@/lib/video/types";

type PrefetchHandle = ReturnType<typeof PrefetchFn>;

let prefetchPromise: Promise<typeof PrefetchFn> | null = null;
const loadPrefetch = () =>
	(prefetchPromise ??= import("remotion")
		.then((m) => m.prefetch)
		.catch((err) => {
			prefetchPromise = null;
			throw err;
		}));

export function collectUrls(layout: VideoLayout): Set<string> {
	const urls = new Set<string>();
	for (const seq of layout.series) {
		if (seq.element) urls.add(seq.element.url);
	}
	for (const seqs of Object.values(layout.sequences)) {
		if (seqs)
			for (const seq of seqs) {
				if (seq.element) urls.add(seq.element.url);
			}
	}
	return urls;
}

/**
 * Frees handles for URLs no longer needed and prefetches newly required ones,
 * mutating `active` in place. Returns true if any new prefetch was started.
 */
export function reconcilePrefetch(
	desired: Set<string>,
	active: Map<string, PrefetchHandle>,
	prefetch: typeof PrefetchFn,
): boolean {
	for (const [url, handle] of active) {
		if (!desired.has(url)) {
			handle.free();
			active.delete(url);
		}
	}
	let added = false;
	for (const url of desired) {
		if (!active.has(url)) {
			active.set(url, prefetch(url));
			added = true;
		}
	}
	return added;
}

export function useAssetPrefetch(layout: VideoLayout | null): boolean {
	const activeRef = useRef(new Map<string, PrefetchHandle>());
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!layout) return;
		let cancelled = false;

		loadPrefetch()
			.then(async (prefetch) => {
				if (cancelled) return;
				const active = activeRef.current;
				if (reconcilePrefetch(collectUrls(layout), active, prefetch)) {
					setReady(false);
				}
				await Promise.all([...active.values()].map((h) => h.waitUntilDone()));
				if (!cancelled) setReady(true);
			})
			.catch((err) => {
				if (cancelled) return;
				console.error("Failed to load remotion for prefetch", err);
				setReady(true);
			});

		return () => {
			cancelled = true;
		};
	}, [layout]);

	useEffect(() => {
		const active = activeRef.current;
		return () => {
			for (const handle of active.values()) handle.free();
			active.clear();
		};
	}, []);

	return ready;
}
