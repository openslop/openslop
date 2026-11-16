// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { useNumberScrub } from "../use-number-scrub";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function Harness({ onChange }: { onChange: (value: number) => void }) {
	const { editing, inputProps, scrubProps } = useNumberScrub({
		value: 400,
		min: 100,
		max: 6400,
		step: 25,
		resetValue: 100,
		onChange,
	});
	return editing ? <input {...inputProps} /> : <div {...scrubProps} />;
}

describe("useNumberScrub", () => {
	it("returns to resetValue on double-click", () => {
		const onChange = vi.fn();
		const container = document.createElement("div");
		document.body.append(container);
		const root = createRoot(container);
		act(() => root.render(<Harness onChange={onChange} />));
		const spinbutton = container.querySelector('[role="spinbutton"]');
		act(() => {
			spinbutton?.dispatchEvent(
				new PointerEvent("pointerdown", { bubbles: true }),
			);
			spinbutton?.dispatchEvent(
				new PointerEvent("pointerup", { bubbles: true }),
			);
		});
		act(() => {
			container
				.querySelector("input")
				?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
		});
		expect(onChange).toHaveBeenCalledWith(100);
		expect(container.querySelector("input")).toBeNull();
		act(() => root.unmount());
	});
});
