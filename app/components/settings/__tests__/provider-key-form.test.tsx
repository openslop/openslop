// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ProviderKeyForm } from "../provider-key-form";

const saveKey = vi.fn();
const warn = vi.hoisted(() => vi.fn());

vi.mock("@/lib/user/use-account", () => ({
	useAccount: () => saveKey,
}));
vi.mock("sonner", () => ({ toast: { warning: warn } }));

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
		saveKey.mockResolvedValue({
			verdict: "invalid",
			error: "The vendor refused it",
		});

		await submit();

		const alert = container.querySelector('[role="alert"]');
		const input = container.querySelector("input");
		expect(alert?.textContent).toBe("The vendor refused it");
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		expect(input?.getAttribute("aria-describedby")).toBe(alert?.id);
		expect(onSaved).not.toHaveBeenCalled();
	});

	// Not a rejection: the key is stored and unverified, so the form is done.
	it("closes on a key the vendor could not be asked about, and says so", async () => {
		saveKey.mockResolvedValue({ verdict: "unknown", error: "No answer" });

		await submit();

		expect(warn).toHaveBeenCalledWith("No answer");
		expect(onSaved).toHaveBeenCalled();
		expect(container.querySelector("input")?.getAttribute("aria-invalid")).toBe(
			"false",
		);
	});

	it("clears the rejection once the key is edited", async () => {
		saveKey.mockResolvedValue({
			verdict: "invalid",
			error: "The vendor refused it",
		});
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
