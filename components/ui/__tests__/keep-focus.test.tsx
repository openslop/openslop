// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { keepFocus } from "../keep-focus";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
const root = createRoot(container);

afterEach(() => act(() => root.unmount()));

describe("keepFocus", () => {
	it("swallows the press so focus stays where it was", () => {
		act(() => root.render(<button type="button" onMouseDown={keepFocus} />));
		const button = container.querySelector("button");
		if (!button) throw new Error("no button rendered");
		const press = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		button.dispatchEvent(press);
		expect(press.defaultPrevented).toBe(true);
	});
});
