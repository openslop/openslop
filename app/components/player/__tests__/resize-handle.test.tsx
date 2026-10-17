// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ResizeHandle } from "../resize-handle";
import { useResize } from "../use-resize";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function Harness() {
	const { handleProps, resizing } = useResize({
		axis: "vertical",
		defaultSize: 200,
		minSize: 100,
		maxViewportFraction: 0.5,
	});
	return (
		<ResizeHandle
			axis="vertical"
			resizing={resizing}
			handleProps={handleProps}
		/>
	);
}

describe("ResizeHandle", () => {
	const container = document.createElement("div");
	let root: Root;

	beforeEach(() => {
		Object.defineProperty(window, "innerHeight", {
			value: 1000,
			configurable: true,
		});
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
	});

	const render = () => {
		act(() => root.render(<Harness />));
		const handle = container.querySelector<HTMLElement>('[role="separator"]');
		if (!handle) throw new Error("no separator rendered");
		return handle;
	};

	const press = (handle: HTMLElement, key: string) => {
		const event = new KeyboardEvent("keydown", {
			key,
			bubbles: true,
			cancelable: true,
		});
		act(() => {
			handle.dispatchEvent(event);
		});
		return event;
	};

	it("is a named, focusable separator that reports the panel size and its bounds", () => {
		const handle = render();

		expect(handle.tabIndex).toBe(0);
		expect(handle.getAttribute("aria-label")).toBe("Resize panel");
		expect(handle.getAttribute("aria-orientation")).toBe("horizontal");
		expect(handle.getAttribute("aria-valuenow")).toBe("200");
		expect(handle.getAttribute("aria-valuemin")).toBe("100");
		expect(handle.getAttribute("aria-valuemax")).toBe("500");
	});

	it("resizes by a step on the arrow key along its axis", () => {
		const handle = render();

		expect(press(handle, "ArrowDown").defaultPrevented).toBe(true);
		expect(handle.getAttribute("aria-valuenow")).toBe("216");

		expect(press(handle, "ArrowLeft").defaultPrevented).toBe(false);
		expect(handle.getAttribute("aria-valuenow")).toBe("216");
	});
});
