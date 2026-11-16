// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { useTimelineZoom } from "../use-timeline-zoom";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function renderTimelineHook(
	totalDurationSec = 100,
	viewportWidth = 1000,
	playheadSec = 0,
) {
	let latest: ReturnType<typeof useTimelineZoom> | undefined;
	const scroller = {
		scrollLeft: 0,
		scrollTo({ left }: { left: number }) {
			const max = totalDurationSec * (latest?.pxPerSec ?? 0) - viewportWidth;
			this.scrollLeft = Math.min(Math.max(left, 0), Math.max(max, 0));
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
	act(() => root.render(<TestHarness />));

	return {
		scroller,
		get current() {
			if (!latest) throw new Error("useTimelineZoom has not rendered");
			return latest;
		},
		zoomIn() {
			act(() => this.current.zoomIn());
		},
		zoomOut() {
			act(() => this.current.zoomOut());
		},
		setZoom(percent: number) {
			act(() => this.current.setZoom(percent));
		},
		unmount() {
			act(() => root.unmount());
		},
	};
}

describe("useTimelineZoom", () => {
	it("starts at fit-to-width", () => {
		const hook = renderTimelineHook(100, 1000);
		expect(hook.current.zoom).toBe(100);
		expect(hook.current.pxPerSec).toBe(10);
		hook.unmount();
	});

	it("scales pxPerSec by the zoom percent", () => {
		const hook = renderTimelineHook(50, 1000);
		expect(hook.current.pxPerSec).toBe(20);

		hook.setZoom(250);
		expect(hook.current.zoom).toBe(250);
		expect(hook.current.pxPerSec).toBe(50);
		hook.unmount();
	});

	it("keeps the playhead at the same place on screen through every zoom", () => {
		const hook = renderTimelineHook(100, 1000, 50);
		const playheadOnScreen = () =>
			50 * hook.current.pxPerSec - hook.scroller.scrollLeft;
		expect(playheadOnScreen()).toBe(500);

		for (const percent of [125, 400, 6400, 175]) {
			hook.setZoom(percent);
			expect(playheadOnScreen()).toBeCloseTo(500);
		}
		hook.setZoom(100);
		expect(hook.scroller.scrollLeft).toBe(0);
		hook.unmount();
	});

	it("steps the buttons through the zoom stops, from wherever a drag left off", () => {
		const hook = renderTimelineHook(100, 1000);
		expect(hook.current.canZoomOut).toBe(false);

		hook.zoomIn();
		expect(hook.current.zoom).toBe(125);
		hook.setZoom(175);
		hook.zoomIn();
		expect(hook.current.zoom).toBe(200);
		hook.setZoom(175);
		hook.zoomOut();
		expect(hook.current.zoom).toBe(150);

		while (hook.current.canZoomIn) hook.zoomIn();
		expect(hook.current.zoom).toBe(6400);
		while (hook.current.canZoomOut) hook.zoomOut();
		expect(hook.current.zoom).toBe(100);
		hook.unmount();
	});
});
