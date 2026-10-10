// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import AccessCodeInput from "../AccessCodeInput";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
	act(() => root.render(<AccessCodeInput />));
});

afterEach(() => {
	act(() => root.unmount());
});

const submit = () =>
	act(() => {
		container
			.querySelector("form")
			?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
	});

describe("AccessCodeInput", () => {
	it("submits the code through a form owned by the Get Started button", () => {
		expect(container.firstElementChild?.tagName).toBe("FORM");
		expect(
			container.querySelector('[aria-label="Code character 6"]'),
		).not.toBeNull();
		const button = container.querySelector('button[type="submit"]');
		expect(button?.textContent).toBe("Get Started");
	});

	it("keeps an empty status region mounted so Validating is announced", () => {
		expect(container.querySelector('[role="status"]')?.textContent).toBe("");
		expect(container.querySelector('[role="alert"]')).toBeNull();
	});

	it("announces an incomplete code and marks the cells invalid", () => {
		submit();

		const alert = container.querySelector('[role="alert"]');
		expect(alert?.textContent).toMatch(/^Enter all \d+ characters/);
		expect(
			container
				.querySelector('[role="group"]')
				?.getAttribute("aria-describedby"),
		).toBe(alert?.id);
		expect(
			container
				.querySelector('[aria-label="Code character 1"]')
				?.getAttribute("aria-invalid"),
		).toBe("true");
	});
});
