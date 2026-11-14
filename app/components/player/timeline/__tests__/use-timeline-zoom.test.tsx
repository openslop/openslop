// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { anchoredScrollLeft, useTimelineZoom } from "../use-timeline-zoom";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function renderTimelineHook(
	totalDurationSec = 100,
	viewportWidth = 1000,
	playheadSec = 0,
) {
	let latest: ReturnType<typeof useTimelineZoom> | undefined;
	// A stand-in scroller: its scroll range follows the current scale, as the
	// timeline's grid does once the new width lays out.
	const scroller = {
		scrollLeft: 0,
		clientWidth: viewportWidth,
		get scrollWidth() {
			return totalDurationSec * (latest?.pxPerSec ?? 0);
		},
		scrollTo({ left }: { left: number }) {
			this.scrollLeft = left;
		},
	};
	const viewport = { current: scroller as unknown as HTMLElement };
	function TestHarness() {
		latest = useTimelineZoom(
			totalDurationSec,
			viewportWidth,
			viewport,
			() => playheadSec,
		);
		return null;
	}

	const container = document.createElement("div");
	const root = createRoot(container);
	act(() => {
		root.render(<TestHarness />);
	});

	return {
		scroller,
		get current() {
			if (!latest) throw new Error("useTimelineZoom has not rendered");
			return latest;
		},
		zoomIn() {
			act(() => {
				this.current.zoomIn();
			});
		},
		zoomOut() {
			act(() => {
				this.current.zoomOut();
			});
		},
		unmount() {
			act(() => {
				root.unmount();
			});
		},
	};
}

describe("useTimelineZoom behavior", () => {
	it("initializes at fit-to-width (zoom 1x) with canZoomOut disabled", () => {
		const hook = renderTimelineHook(100, 1000);
		expect(hook.current.zoom).toBe(1);
		expect(hook.current.pxPerSec).toBe(10);
		expect(hook.current.canZoomOut).toBe(false);
		expect(hook.current.canZoomIn).toBe(true);
		hook.unmount();
	});

	it("steps through zoom levels on zoomIn up to maximum 64x and disables canZoomIn", () => {
		const hook = renderTimelineHook(100, 1000);

		while (hook.current.canZoomIn) {
			const before = hook.current.zoom;
			hook.zoomIn();
			expect(hook.current.zoom).toBeGreaterThan(before);
			expect(hook.current.canZoomOut).toBe(true);
		}

		expect(hook.current.zoom).toBe(64);
		expect(hook.current.canZoomIn).toBe(false);

		hook.zoomIn();
		expect(hook.current.zoom).toBe(64);
		expect(hook.current.canZoomIn).toBe(false);
		hook.unmount();
	});

	it("steps down through zoom levels on zoomOut and clamps at 1x", () => {
		const hook = renderTimelineHook(100, 1000);

		hook.zoomIn();
		hook.zoomIn();
		expect(hook.current.zoom).toBe(1.5);

		hook.zoomOut();
		expect(hook.current.zoom).toBe(1.25);
		expect(hook.current.canZoomOut).toBe(true);

		hook.zoomOut();
		expect(hook.current.zoom).toBe(1);
		expect(hook.current.canZoomOut).toBe(false);

		hook.zoomOut();
		expect(hook.current.zoom).toBe(1);
		expect(hook.current.canZoomOut).toBe(false);
		hook.unmount();
	});

	it("calculates pxPerSec proportionally to duration and viewport", () => {
		const hook = renderTimelineHook(50, 1000);
		expect(hook.current.pxPerSec).toBe(20);

		hook.zoomIn();
		expect(hook.current.pxPerSec).toBe(25);
		hook.unmount();
	});

	it("keeps the playhead at the same place on screen through every zoom step", () => {
		const hook = renderTimelineHook(100, 1000, 50);
		const playheadOnScreen = () =>
			50 * hook.current.pxPerSec - hook.scroller.scrollLeft;
		expect(playheadOnScreen()).toBe(500);

		while (hook.current.canZoomIn) {
			hook.zoomIn();
			expect(playheadOnScreen()).toBeCloseTo(500);
		}
		while (hook.current.canZoomOut) {
			hook.zoomOut();
			expect(playheadOnScreen()).toBeCloseTo(500);
		}
		expect(hook.scroller.scrollLeft).toBe(0);
		hook.unmount();
	});
});

describe("anchoredScrollLeft", () => {
	const at = (fields: Partial<Parameters<typeof anchoredScrollLeft>[0]>) =>
		anchoredScrollLeft({
			scrollLeft: 300,
			anchorSec: 50,
			fromPxPerSec: 10,
			toPxPerSec: 12.5,
			maxScrollLeft: 10_000,
			...fields,
		});

	it("keeps the anchor's offset from the left edge when zooming in", () => {
		const scrollLeft = at({});
		expect(scrollLeft).toBe(425);
		expect(50 * 12.5 - scrollLeft).toBe(50 * 10 - 300);
	});

	it("keeps the anchor's offset from the left edge when zooming out", () => {
		const scrollLeft = at({ fromPxPerSec: 20, toPxPerSec: 16 });
		expect(scrollLeft).toBe(100);
		expect(50 * 16 - scrollLeft).toBe(50 * 20 - 300);
	});

	it("stops at the start when the anchor is near it", () => {
		expect(at({ anchorSec: 1, fromPxPerSec: 20, toPxPerSec: 10 })).toBe(290);
		expect(
			at({ scrollLeft: 5, anchorSec: 1, fromPxPerSec: 20, toPxPerSec: 10 }),
		).toBe(0);
	});

	it("stops at the end of the scroll range", () => {
		expect(at({ maxScrollLeft: 400 })).toBe(400);
	});

	it("goes back to the start at fit-to-width, where nothing scrolls", () => {
		expect(at({ fromPxPerSec: 12.5, toPxPerSec: 10, maxScrollLeft: 0 })).toBe(
			0,
		);
	});
});
