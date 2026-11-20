// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toastError } from "@/lib/toast-error";
import { CopyButton } from "../copy-button";
import { TooltipProvider } from "../tooltip";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/toast-error", () => ({ toastError: vi.fn() }));

const writeText = vi.fn<(text: string) => Promise<void>>();
Object.defineProperty(navigator, "clipboard", { value: { writeText } });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

const button = () => container.querySelector<HTMLButtonElement>("button");

beforeEach(() => {
	root = createRoot(container);
	act(() =>
		root.render(
			<TooltipProvider>
				<CopyButton text="Runware: refused" label="Copy error message" />
			</TooltipProvider>,
		),
	);
});

afterEach(() => {
	act(() => root.unmount());
	vi.useRealTimers();
});

describe("CopyButton", () => {
	it("confirms a copy that landed, then resets", async () => {
		vi.useFakeTimers();
		writeText.mockResolvedValue(undefined);

		await act(async () => button()?.click());

		expect(writeText).toHaveBeenCalledWith("Runware: refused");
		expect(button()?.getAttribute("aria-label")).toBe("Copied");

		act(() => vi.advanceTimersByTime(1500));

		expect(button()?.getAttribute("aria-label")).toBe("Copy error message");
	});

	it("tells the user when the clipboard refuses", async () => {
		const refused = new Error("Document is not focused");
		writeText.mockRejectedValue(refused);

		await act(async () => button()?.click());

		expect(toastError).toHaveBeenCalledWith(refused, "Couldn't copy the text");
		expect(button()?.getAttribute("aria-label")).toBe("Copy error message");
	});
});
