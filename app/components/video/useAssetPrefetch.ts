import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { prefetch } from "remotion";
import type { VideoLayout } from "@/lib/video/types";
import { PrefetchReadyStore } from "./PrefetchReadyStore";

type PrefetchHandle = ReturnType<typeof prefetch>;

function collectUrls(layout: VideoLayout): Set<string> {
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

function freeStale(active: Map<string, PrefetchHandle>, desired: Set<string>) {
	for (const [url, handle] of active) {
		if (!desired.has(url)) {
			handle.free();
			active.delete(url);
		}
	}
}

function prefetchNew(
	active: Map<string, PrefetchHandle>,
	desired: Set<string>,
	store: PrefetchReadyStore,
) {
	for (const url of desired) {
		if (!active.has(url)) {
			store.onPrefetchStart();
			const handle = prefetch(url);
			active.set(url, handle);
			handle.waitUntilDone().then(store.onPrefetchEnd, store.onPrefetchEnd);
		}
	}
}

export function useAssetPrefetch(layout: VideoLayout | null): boolean {
	const activeRef = useRef(new Map<string, PrefetchHandle>());
	const [store] = useState(() => new PrefetchReadyStore());

	useEffect(() => {
		if (!layout) return;
		const desired = collectUrls(layout);
		freeStale(activeRef.current, desired);
		prefetchNew(activeRef.current, desired, store);
		store.syncReady();
	}, [layout, store]);

	useEffect(() => {
		const active = activeRef.current;
		return () => {
			for (const handle of active.values()) handle.free();
			active.clear();
		};
	}, []);

	return useSyncExternalStore(store.subscribe, store.getReady);
}
