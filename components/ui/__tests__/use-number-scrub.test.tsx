// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNumberScrub } from "../use-number-scrub";

function Harness({ onChange }: { onChange: (value: number) => void }) {
	const { editing, inputProps, scrubProps } = useNumberScrub({
		value: 400,
		min: 100,
		max: 6400,
		step: 25,
		resetValue: 100,
		onChange,
	});
	return (
		<>
			{editing ? (
				<input {...inputProps} />
			) : (
				<div {...scrubProps} tabIndex={0} />
			)}
			<button type="button">next</button>
		</>
	);
}

let root: Root | undefined;

afterEach(() => {
	act(() => root?.unmount());
	document.body.replaceChildren();
});

function mount(onChange: (value: number) => void) {
	const container = document.createElement("div");
	document.body.append(container);
	const created = createRoot(container);
	root = created;
	act(() => created.render(<Harness onChange={onChange} />));
	return container;
}

function spinbuttonIn(container: HTMLElement) {
	return container.querySelector<HTMLElement>('[role="spinbutton"]');
}

function openInput(container: HTMLElement) {
	const spinbutton = spinbuttonIn(container);
	act(() => {
		spinbutton?.focus();
		spinbutton?.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	const input = container.querySelector("input");
	if (!input) throw new Error("the input did not open");
	return input;
}

function type(input: HTMLInputElement, text: string) {
	act(() => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(input, text);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function press(input: HTMLInputElement, key: string) {
	act(() => {
		input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
	});
}

describe("useNumberScrub", () => {
	it("returns to resetValue on double-click and keeps focus on the value", () => {
		const onChange = vi.fn();
		const container = mount(onChange);
		const spinbutton = spinbuttonIn(container);
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
		expect(document.activeElement).toBe(spinbuttonIn(container));
	});

	it("commits a typed value on Enter and keeps focus on the value", () => {
		const onChange = vi.fn();
		const container = mount(onChange);
		const input = openInput(container);
		expect(document.activeElement).toBe(input);

		type(input, "300");
		press(input, "Enter");

		expect(onChange).toHaveBeenCalledWith(300);
		expect(container.querySelector("input")).toBeNull();
		expect(document.activeElement).toBe(spinbuttonIn(container));
	});

	it("drops a typed value on Escape and keeps focus on the value", () => {
		const onChange = vi.fn();
		const container = mount(onChange);
		const input = openInput(container);

		type(input, "300");
		press(input, "Escape");

		expect(onChange).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(spinbuttonIn(container));
	});

	it("commits on blur and leaves focus where it went", () => {
		const onChange = vi.fn();
		const container = mount(onChange);
		const input = openInput(container);
		const next = container.querySelector("button");

		type(input, "300");
		act(() => next?.focus());

		expect(onChange).toHaveBeenCalledWith(300);
		expect(container.querySelector("input")).toBeNull();
		expect(document.activeElement).toBe(next);
	});
});
