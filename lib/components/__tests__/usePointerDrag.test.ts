import { describe, expect, it, vi } from "vitest";
import type { PointerEvent } from "react";
import { usePointerDrag } from "../usePointerDrag";

/** A pointer event over a target that tracks its own capture, like the DOM does. */
function pointerEvent(
	target: { captured: Set<number> },
	{ button = 0, pointerId = 1, clientX = 0 } = {},
) {
	const currentTarget = {
		setPointerCapture: (id: number) => target.captured.add(id),
		releasePointerCapture: (id: number) => target.captured.delete(id),
		hasPointerCapture: (id: number) => target.captured.has(id),
		getBoundingClientRect: () => ({ left: 0, width: 100 }),
	};
	return {
		button,
		pointerId,
		clientX,
		currentTarget,
	} as unknown as PointerEvent<HTMLElement>;
}

const surface = () => ({ captured: new Set<number>() });

describe("usePointerDrag", () => {
	it("captures the pointer and reports the press as a move", () => {
		const target = surface();
		const onStart = vi.fn();
		const onMove = vi.fn();
		const props = usePointerDrag({ onStart, onMove });

		props.onPointerDown(pointerEvent(target));

		expect(target.captured.has(1)).toBe(true);
		expect(onStart).toHaveBeenCalledTimes(1);
		expect(onMove).toHaveBeenCalledTimes(1);
	});

	it("ignores a non-primary button", () => {
		const target = surface();
		const onMove = vi.fn();
		const props = usePointerDrag({ onMove });

		props.onPointerDown(pointerEvent(target, { button: 2 }));

		expect(target.captured.size).toBe(0);
		expect(onMove).not.toHaveBeenCalled();
	});

	it("reports moves only while the pointer is captured", () => {
		const target = surface();
		const onMove = vi.fn();
		const props = usePointerDrag({ onMove });

		props.onPointerMove(pointerEvent(target, { clientX: 10 }));
		expect(onMove).not.toHaveBeenCalled();

		props.onPointerDown(pointerEvent(target));
		props.onPointerMove(pointerEvent(target, { clientX: 20 }));
		expect(onMove).toHaveBeenCalledTimes(2);
	});

	it("releases the pointer and ends the drag exactly once", () => {
		const target = surface();
		const onEnd = vi.fn();
		const props = usePointerDrag({ onMove: () => {}, onEnd });

		props.onPointerDown(pointerEvent(target));
		props.onPointerUp(pointerEvent(target));
		props.onPointerUp(pointerEvent(target));

		expect(target.captured.size).toBe(0);
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it("ends the drag on cancel too", () => {
		const target = surface();
		const onEnd = vi.fn();
		const props = usePointerDrag({ onMove: () => {}, onEnd });

		props.onPointerDown(pointerEvent(target));
		props.onPointerCancel(pointerEvent(target));

		expect(target.captured.size).toBe(0);
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it("does not end a drag that never started", () => {
		const target = surface();
		const onEnd = vi.fn();
		const props = usePointerDrag({ onMove: () => {}, onEnd });

		props.onPointerUp(pointerEvent(target));

		expect(onEnd).not.toHaveBeenCalled();
	});
});
