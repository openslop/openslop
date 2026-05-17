import { describe, expect, it, vi } from "vitest";
import type { prefetch as PrefetchFn } from "remotion";
import type { ResolvedElement, Sequence, VideoLayout } from "@/lib/video/types";
import { collectUrls, reconcilePrefetch } from "../useAssetPrefetch";

type PrefetchHandle = ReturnType<typeof PrefetchFn>;

function el(url: string): ResolvedElement {
	return {
		id: url,
		type: "image",
		role: "foreground",
		layer: "visual",
		url,
		durationSec: 1,
		loops: 1,
		volume: 1,
	};
}

function seq(element: ResolvedElement | null): Sequence {
	return { element, start: 0, duration: 1 };
}

function layout(partial: Partial<VideoLayout>): VideoLayout {
	return {
		series: [],
		sequences: {},
		fps: 30,
		width: 1920,
		height: 1080,
		totalDurationSec: 1,
		totalFrames: 30,
		transitionType: "none",
		transitionDurationSec: 0,
		...partial,
	};
}

function fakeHandle(): PrefetchHandle {
	return {
		free: vi.fn(),
		waitUntilDone: () => Promise.resolve("done"),
	} as unknown as PrefetchHandle;
}

describe("collectUrls", () => {
	it("collects urls from series and sequences, deduped, skipping null elements", () => {
		const urls = collectUrls(
			layout({
				series: [seq(el("a")), seq(null), seq(el("b"))],
				sequences: {
					music: [seq(el("a")), seq(el("c"))],
					sound: undefined,
				},
			}),
		);
		expect([...urls].sort()).toEqual(["a", "b", "c"]);
	});

	it("returns an empty set for an empty layout", () => {
		expect(collectUrls(layout({})).size).toBe(0);
	});
});

describe("reconcilePrefetch", () => {
	it("prefetches newly required urls and reports added=true", () => {
		const active = new Map<string, PrefetchHandle>();
		const prefetch = vi.fn(() => fakeHandle());
		const added = reconcilePrefetch(
			new Set(["a", "b"]),
			active,
			prefetch as unknown as typeof PrefetchFn,
		);
		expect(added).toBe(true);
		expect(prefetch).toHaveBeenCalledTimes(2);
		expect([...active.keys()].sort()).toEqual(["a", "b"]);
	});

	it("frees and removes handles for urls no longer desired", () => {
		const stale = fakeHandle();
		const active = new Map<string, PrefetchHandle>([["old", stale]]);
		const added = reconcilePrefetch(
			new Set<string>(),
			active,
			vi.fn() as unknown as typeof PrefetchFn,
		);
		expect(stale.free).toHaveBeenCalledTimes(1);
		expect(active.has("old")).toBe(false);
		expect(added).toBe(false);
	});

	it("does not re-prefetch already-active urls and reports added=false", () => {
		const existing = fakeHandle();
		const active = new Map<string, PrefetchHandle>([["a", existing]]);
		const prefetch = vi.fn(() => fakeHandle());
		const added = reconcilePrefetch(
			new Set(["a"]),
			active,
			prefetch as unknown as typeof PrefetchFn,
		);
		expect(prefetch).not.toHaveBeenCalled();
		expect(existing.free).not.toHaveBeenCalled();
		expect(active.get("a")).toBe(existing);
		expect(added).toBe(false);
	});

	it("simultaneously frees stale handles and adds new ones in one pass", () => {
		const stale = fakeHandle();
		const active = new Map<string, PrefetchHandle>([["old", stale]]);
		const prefetch = vi.fn(() => fakeHandle());
		const added = reconcilePrefetch(
			new Set(["new"]),
			active,
			prefetch as unknown as typeof PrefetchFn,
		);
		expect(stale.free).toHaveBeenCalledTimes(1);
		expect(active.has("old")).toBe(false);
		expect(active.has("new")).toBe(true);
		expect(added).toBe(true);
	});
});
