import { describe, expect, it, vi } from "vitest";
import {
	attachResizeListeners,
	clampResize,
	panelSizeStyle,
} from "../useResize";

describe("panelSizeStyle", () => {
	it("sizes a vertical panel by height, defaulting until a drag writes one", () => {
		expect(panelSizeStyle("vertical", 260)).toEqual({
			height: "var(--panel-size, 260px)",
		});
	});

	it("sizes a horizontal panel by width", () => {
		expect(panelSizeStyle("horizontal", 560)).toEqual({
			width: "var(--panel-size, 560px)",
		});
	});
});

describe("clampResize", () => {
	it("expands vertically when cursor moves down", () => {
		expect(clampResize("vertical", 100, 150, 200, 50, 500)).toBe(250);
	});

	it("expands horizontally when cursor moves left (delta = start - current)", () => {
		expect(clampResize("horizontal", 200, 150, 200, 50, 500)).toBe(250);
	});

	it("clamps to minSize", () => {
		expect(clampResize("vertical", 100, 0, 50, 50, 500)).toBe(50);
	});

	it("clamps to maxSize", () => {
		expect(clampResize("vertical", 0, 10_000, 100, 50, 500)).toBe(500);
	});

	it("grows against the pointer when the handle is on the leading edge", () => {
		expect(clampResize("vertical", 500, 400, 200, 100, 600, true)).toBe(300);
		expect(clampResize("vertical", 500, 600, 200, 100, 600, true)).toBe(100);
	});
});

function createHost() {
	const listeners = new Map<string, Set<(ev: MouseEvent) => void>>();
	return {
		listeners,
		addEventListener(type: string, listener: (ev: MouseEvent) => void) {
			let set = listeners.get(type);
			if (!set) {
				set = new Set();
				listeners.set(type, set);
			}
			set.add(listener);
		},
		removeEventListener(type: string, listener: (ev: MouseEvent) => void) {
			listeners.get(type)?.delete(listener);
		},
		fire(type: string, ev: Partial<MouseEvent>) {
			for (const l of listeners.get(type) ?? []) l(ev as MouseEvent);
		},
		count(type: string) {
			return listeners.get(type)?.size ?? 0;
		},
	};
}

describe("attachResizeListeners", () => {
	it("registers move and up listeners", () => {
		const host = createHost();
		attachResizeListeners(host, {
			axis: "vertical",
			startPos: 0,
			startSize: 100,
			minSize: 50,
			maxSize: 500,
			onResize: () => {},
			onEnd: () => {},
		});
		expect(host.count("mousemove")).toBe(1);
		expect(host.count("mouseup")).toBe(1);
	});

	it("forwards mousemove deltas through clampResize to onResize", () => {
		const host = createHost();
		const onResize = vi.fn();
		attachResizeListeners(host, {
			axis: "vertical",
			startPos: 100,
			startSize: 200,
			minSize: 0,
			maxSize: 1000,
			onResize,
			onEnd: () => {},
		});
		host.fire("mousemove", { clientY: 150 });
		expect(onResize).toHaveBeenCalledWith(250);
	});

	it("removes both listeners on mouseup and calls onEnd", () => {
		const host = createHost();
		const onEnd = vi.fn();
		attachResizeListeners(host, {
			axis: "vertical",
			startPos: 0,
			startSize: 100,
			minSize: 0,
			maxSize: 500,
			onResize: () => {},
			onEnd,
		});
		host.fire("mouseup", {});
		expect(onEnd).toHaveBeenCalledTimes(1);
		expect(host.count("mousemove")).toBe(0);
		expect(host.count("mouseup")).toBe(0);
	});

	it("returned cleanup removes listeners (covers unmount-during-drag leak)", () => {
		const host = createHost();
		const onResize = vi.fn();
		const onEnd = vi.fn();
		const cleanup = attachResizeListeners(host, {
			axis: "horizontal",
			startPos: 0,
			startSize: 100,
			minSize: 0,
			maxSize: 500,
			onResize,
			onEnd,
		});

		cleanup();

		expect(host.count("mousemove")).toBe(0);
		expect(host.count("mouseup")).toBe(0);
		host.fire("mousemove", { clientX: 200 });
		host.fire("mouseup", {});
		expect(onResize).not.toHaveBeenCalled();
		expect(onEnd).not.toHaveBeenCalled();
	});

	it("cleanup is idempotent — double-cleanup does not double-detach unrelated listeners", () => {
		const host = createHost();
		const cleanup = attachResizeListeners(host, {
			axis: "vertical",
			startPos: 0,
			startSize: 100,
			minSize: 0,
			maxSize: 500,
			onResize: () => {},
			onEnd: () => {},
		});

		// Re-add a fresh mousemove to verify second cleanup() doesn't touch it.
		const sentinel = vi.fn();
		cleanup();
		host.addEventListener("mousemove", sentinel);
		cleanup();
		expect(host.count("mousemove")).toBe(1);
	});
});
