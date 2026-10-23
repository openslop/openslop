// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { breakMask, ScrubBar } from "../scrub-bar";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("breakMask", () => {
	it("cuts a 2px notch centred on each break", () => {
		expect(breakMask([0.25, 0.75])).toBe(
			"linear-gradient(to right, #000, " +
				"#000 calc(25% - 1px), transparent calc(25% - 1px), " +
				"transparent calc(25% + 1px), #000 calc(25% + 1px), " +
				"#000 calc(75% - 1px), transparent calc(75% - 1px), " +
				"transparent calc(75% + 1px), #000 calc(75% + 1px), #000)",
		);
	});

	it("leaves a track without breaks unmasked", () => {
		expect(breakMask([])).toBe("none");
	});

	it("splits many breaks across layers Chrome can draw exactly", () => {
		const breaks = Array.from({ length: 94 }, (_, i) => (i + 1) / 95);
		const layers = breakMask(breaks).split("linear-gradient").slice(1);

		expect(
			layers.map((layer) => layer.split("transparent").length - 1),
		).toEqual([60, 60, 60, 8]);
	});
});

describe("ScrubBar", () => {
	const container = document.body.appendChild(document.createElement("div"));
	let root: Root;
	const calls: string[] = [];
	const handlers = {
		onScrubStart: () => calls.push("start"),
		onScrub: (ratio: number) => calls.push(`scrub ${ratio}`),
		onScrubEnd: () => calls.push("end"),
	};

	beforeEach(() => {
		root = createRoot(container);
		calls.length = 0;
	});

	afterEach(() => {
		act(() => root.unmount());
	});

	const render = (
		props: {
			disabled?: boolean;
			breaks?: number[];
			ariaValueText?: string;
		} = {},
	) => {
		act(() =>
			root.render(
				<ScrubBar
					ariaLabel="Seek"
					value={0.5}
					keyStep={0.25}
					{...handlers}
					{...props}
				/>,
			),
		);
		const slider = container.querySelector<HTMLElement>('[role="slider"]');
		if (!slider) throw new Error("no slider rendered");
		return slider;
	};

	const press = (slider: HTMLElement, key: string) => {
		const event = new KeyboardEvent("keydown", {
			key,
			bubbles: true,
			cancelable: true,
		});
		act(() => {
			slider.dispatchEvent(event);
		});
		return event;
	};

	it("is a slider in the tab order that reports its value", () => {
		const slider = render();

		expect(slider.tabIndex).toBe(0);
		expect(slider.getAttribute("aria-valuenow")).toBe("50");
	});

	it("reads the percent unless the caller words the value", () => {
		expect(render().hasAttribute("aria-valuetext")).toBe(false);
		expect(
			render({ ariaValueText: "0:12 of 1:30" }).getAttribute("aria-valuetext"),
		).toBe("0:12 of 1:30");
	});

	it("scrubs on an arrow key as a zero-length drag", () => {
		const event = press(render(), "ArrowRight");

		expect(calls).toEqual(["start", "scrub 0.75", "end"]);
		expect(event.defaultPrevented).toBe(true);
	});

	it("leaves a key it does not own to the browser", () => {
		const event = press(render(), "Tab");

		expect(calls).toEqual([]);
		expect(event.defaultPrevented).toBe(false);
	});

	it("leaves the tab order and ignores keys while disabled", () => {
		const slider = render({ disabled: true });
		press(slider, "ArrowRight");

		expect(slider.tabIndex).toBe(-1);
		expect(slider.getAttribute("aria-disabled")).toBe("true");
		expect(calls).toEqual([]);
	});

	it("fills one linear track whatever its breaks", () => {
		const slider = render({ breaks: [0.1, 0.2, 0.3] });
		const fill = slider.querySelector<HTMLElement>(".bg-scrub-progress");

		expect(slider.querySelectorAll(".bg-scrub-track")).toHaveLength(1);
		expect(fill?.style.width).toBe("calc(var(--scrub-pos) * 100%)");
		expect(slider.style.getPropertyValue("--scrub-pos")).toBe("0.5");
	});
});
