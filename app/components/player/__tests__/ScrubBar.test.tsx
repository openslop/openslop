// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ScrubBar, scrubKeyTarget, segmentStyle } from "../ScrubBar";

type Vars = Record<string, unknown>;

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("segmentStyle", () => {
	it("lays segments end to end by their basis", () => {
		const styles = segmentStyle([
			{ id: "a", basis: 0.25 },
			{ id: "b", basis: 0.5 },
			{ id: "c", basis: 0.25 },
		]) as Vars[];

		expect(styles.map((s) => s.flexBasis)).toEqual(["25%", "50%", "25%"]);
		expect(styles.map((s) => s["--seg-start"])).toEqual([0, 0.25, 0.75]);
		expect(styles.map((s) => s["--seg-scale"])).toEqual([4, 2, 4]);
	});

	it("keeps a zero-width segment's scale finite", () => {
		const [zero] = segmentStyle([{ id: "a", basis: 0 }]) as Vars[];

		expect(zero["--seg-scale"]).toBe(0);
	});
});

describe("scrubKeyTarget", () => {
	it.each([
		["ArrowRight", 0.75],
		["ArrowUp", 0.75],
		["ArrowLeft", 0.25],
		["ArrowDown", 0.25],
		["Home", 0],
		["End", 1],
	])("%s moves 0.5 to %d", (key, target) => {
		expect(scrubKeyTarget(key, 0.5, 0.25)).toBe(target);
	});

	it("stops at the ends of the track", () => {
		expect(scrubKeyTarget("ArrowRight", 0.9, 0.25)).toBe(1);
		expect(scrubKeyTarget("ArrowLeft", 0.1, 0.25)).toBe(0);
	});

	it("leaves every other key alone", () => {
		expect(scrubKeyTarget("Tab", 0.5, 0.25)).toBeNull();
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
		props: { disabled?: boolean; segments?: []; ariaValueText?: string } = {},
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

	it("draws an empty segment list as one continuous track", () => {
		const slider = render({ segments: [] });

		expect(slider.querySelectorAll(".bg-scrub-track")).toHaveLength(1);
	});
});
