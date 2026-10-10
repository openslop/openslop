import type { PointerEvent } from "react";

export type PointerDragProps = {
	onPointerDown: (event: PointerEvent<HTMLElement>) => void;
	onPointerMove: (event: PointerEvent<HTMLElement>) => void;
	onPointerUp: (event: PointerEvent<HTMLElement>) => void;
	onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
};

type PointerDragCallbacks = {
	onStart?: (event: PointerEvent<HTMLElement>) => void;
	/** Fired once on press and again for every move, so a click is a zero-length drag. */
	onMove: (event: PointerEvent<HTMLElement>) => void;
	onEnd?: () => void;
};

/**
 * The one drag protocol: the primary button captures the pointer on the surface
 * it went down on, so the drag keeps reporting after it leaves that surface and
 * ends exactly once. Capture *is* the drag's state, so no caller keeps a flag.
 */
export function usePointerDrag({
	onStart,
	onMove,
	onEnd,
}: PointerDragCallbacks): PointerDragProps {
	const end = (event: PointerEvent<HTMLElement>) => {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
		event.currentTarget.releasePointerCapture(event.pointerId);
		onEnd?.();
	};

	return {
		onPointerDown(event) {
			if (event.button !== 0) return;
			event.currentTarget.setPointerCapture(event.pointerId);
			onStart?.(event);
			onMove(event);
		},
		onPointerMove(event) {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) onMove(event);
		},
		onPointerUp: end,
		onPointerCancel: end,
	};
}
