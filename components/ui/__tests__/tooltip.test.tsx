// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../tooltip";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
const onOpenChange = vi.fn();

function trigger() {
	const button = document.body.querySelector("button");
	if (!button) throw new Error("no trigger");
	return button;
}

function pointer(type: string, target: Element) {
	act(() => {
		target.dispatchEvent(
			new PointerEvent(type, {
				bubbles: type !== "pointerleave",
				pointerType: "mouse",
				clientX: 10,
				clientY: 10,
				relatedTarget: document.body,
			}),
		);
	});
}

// What a browser fires when the pointer moves off the trigger: `pointerout`
// drives React's onPointerLeave, the native `pointerleave` drives Radix's
// hoverable-content grace area.
function leave(target: Element) {
	pointer("pointerout", target);
	pointer("pointerleave", target);
}

function render(open?: boolean) {
	act(() =>
		root.render(
			<TooltipProvider>
				<Tooltip open={open} onOpenChange={onOpenChange}>
					<TooltipTrigger>Export</TooltipTrigger>
					<TooltipContent>Export the video</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		),
	);
}

beforeEach(() => {
	vi.useFakeTimers();
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	vi.useRealTimers();
});

describe("TooltipProvider", () => {
	it("closes a tooltip as soon as the pointer leaves its trigger", () => {
		render(true);
		leave(trigger());
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("still opens a tooltip on hover", () => {
		render();
		pointer("pointermove", trigger());
		act(() => vi.runAllTimers());
		expect(onOpenChange).toHaveBeenCalledWith(true);
	});

	it("still opens a tooltip on keyboard focus", () => {
		render();
		act(() => trigger().focus());
		expect(onOpenChange).toHaveBeenCalledWith(true);
	});
});
