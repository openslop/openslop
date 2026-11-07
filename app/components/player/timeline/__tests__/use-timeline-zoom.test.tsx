// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { useTimelineZoom, ZOOM_LEVELS } from "../use-timeline-zoom";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function renderTimelineHook(totalDurationSec = 100, viewportWidth = 1000) {
	let latest: ReturnType<typeof useTimelineZoom> | undefined;
	function TestHarness() {
		latest = useTimelineZoom(totalDurationSec, viewportWidth);
		return null;
	}

	const container = document.createElement("div");
	const root = createRoot(container);
	act(() => {
		root.render(<TestHarness />);
	});

	return {
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

		for (let i = 1; i < ZOOM_LEVELS.length; i++) {
			expect(hook.current.canZoomIn).toBe(true);
			hook.zoomIn();
			expect(hook.current.zoom).toBe(ZOOM_LEVELS[i]);
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
});

describe("ZOOM_LEVELS sequence", () => {
	it("starts at 1x fit-to-width and ends at 64x", () => {
		expect(ZOOM_LEVELS[0]).toBe(1);
		expect(ZOOM_LEVELS[ZOOM_LEVELS.length - 1]).toBe(64);
	});

	it("contains all legacy stops for continuity", () => {
		const legacyStops = [1, 1.5, 2, 3, 4, 6, 8];
		for (const stop of legacyStops) {
			expect(ZOOM_LEVELS).toContain(stop);
		}
	});
});
