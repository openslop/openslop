import { describe, expect, it, vi } from "vitest";
import type { prefetch as PrefetchFn } from "remotion";
import type { ResolvedElement, Sequence, VideoLayout } from "@/lib/video/types";
import { DEFAULT_CAPTION_STYLE } from "@/lib/video/captionStyle";
import {
	awaitPrefetch,
	collectUrls,
	reconcilePrefetch,
} from "../useAssetPrefetch";

type PrefetchHandle = ReturnType<typeof PrefetchFn>;

function handleRejecting(): PrefetchHandle {
	return {
		free: vi.fn(),
		waitUntilDone: () => Promise.reject(new Error("HTTP error, status = 404")),
	} as unknown as PrefetchHandle;
}

function el(url: string): ResolvedElement {
	return {
		id: url,
		type: "image",
		role: "foreground",
		layer: "visual",
		sceneId: "s1",
		sceneNumber: 1,
		prompt: "",
		url,
		durationSec: 1,
		loops: 1,
		volume: 1,
		motion: "none",
	};
}

function seq(element: ResolvedElement): Sequence {
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
		captionStyle: DEFAULT_CAPTION_STYLE,
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
	it("collects urls from series and sequences, deduped", () => {
		const urls = collectUrls(
			layout({
				series: [seq(el("a")), seq(el("b"))],
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

describe("awaitPrefetch", () => {
	it("resolves once all handles are done", async () => {
		await expect(
			awaitPrefetch([fakeHandle(), fakeHandle()]),
		).resolves.toBeUndefined();
	});

	it("does not reject when a single asset fails to prefetch", async () => {
		// A 404/CORS/network failure on one asset must not short-circuit the wait
		// on the others (Promise.all would reject and reveal the player early).
		await expect(
			awaitPrefetch([fakeHandle(), handleRejecting(), fakeHandle()]),
		).resolves.toBeUndefined();
	});

	it("waits for every handle to settle before resolving", async () => {
		const order: string[] = [];
		const slow = {
			free: vi.fn(),
			waitUntilDone: () =>
				new Promise((res) =>
					queueMicrotask(() => {
						order.push("slow");
						res("done");
					}),
				),
		} as unknown as PrefetchHandle;
		const failing = {
			free: vi.fn(),
			waitUntilDone: () => {
				order.push("fail");
				return Promise.reject(new Error("boom"));
			},
		} as unknown as PrefetchHandle;

		await awaitPrefetch([failing, slow]);
		expect(order).toEqual(["fail", "slow"]);
	});

	it("resolves immediately for an empty handle list", async () => {
		await expect(awaitPrefetch([])).resolves.toBeUndefined();
	});
});
