// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Popover, PopoverContent, PopoverHeader } from "../popover";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
const onOpenChange = vi.fn();

beforeEach(() => {
	root = createRoot(container);
	act(() =>
		root.render(
			<Popover open onOpenChange={onOpenChange}>
				<PopoverContent>
					<PopoverHeader title="Export" />
				</PopoverContent>
			</Popover>,
		),
	);
});

afterEach(() => {
	act(() => root.unmount());
});

describe("PopoverHeader", () => {
	it("names the popover with a heading", () => {
		expect(document.body.querySelector("h3")?.textContent).toBe("Export");
	});

	it("closes the popover from its Close button", () => {
		const close = document.body.querySelector<HTMLButtonElement>(
			'button[aria-label="Close"]',
		);
		if (!close) throw new Error("no Close button");
		act(() => close.click());
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
