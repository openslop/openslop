// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ProviderKeyForm } from "../ProviderKeyForm";

const saveKey = vi.fn();

vi.mock("@/lib/user/useAccount", () => ({
	useAccount: () => saveKey,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
const onSaved = vi.fn();

beforeEach(() => {
	root = createRoot(container);
	act(() =>
		root.render(
			<ProviderKeyForm
				provider="elevenlabs"
				onSaved={onSaved}
				onCancel={vi.fn()}
			/>,
		),
	);
});

afterEach(() => {
	act(() => root.unmount());
	vi.clearAllMocks();
});

const submit = () =>
	act(async () => {
		container
			.querySelector("form")
			?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
	});

describe("ProviderKeyForm", () => {
	it("shows a clean field before anything is saved", () => {
		const input = container.querySelector("input");
		expect(input?.getAttribute("aria-invalid")).toBe("false");
		expect(input?.hasAttribute("aria-describedby")).toBe(false);
		expect(container.querySelector('[role="alert"]')).toBeNull();
	});

	it("marks the field invalid and ties it to the announced rejection", async () => {
		saveKey.mockResolvedValue({ ok: false, error: "The vendor refused it" });

		await submit();

		const alert = container.querySelector('[role="alert"]');
		const input = container.querySelector("input");
		expect(alert?.textContent).toBe("The vendor refused it");
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		expect(input?.getAttribute("aria-describedby")).toBe(alert?.id);
		expect(onSaved).not.toHaveBeenCalled();
	});

	it("clears the rejection once the key is edited", async () => {
		saveKey.mockResolvedValue({ ok: false, error: "The vendor refused it" });
		await submit();

		const input = container.querySelector("input");
		act(() => {
			Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			)?.set?.call(input, "sk-another-key");
			input?.dispatchEvent(new Event("input", { bubbles: true }));
		});

		expect(container.querySelector('[role="alert"]')).toBeNull();
		expect(input?.getAttribute("aria-invalid")).toBe("false");
	});
});
