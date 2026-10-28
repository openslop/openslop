// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toastError } from "@/lib/toast-error";
import { ErrorMessage } from "../overlays";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/toast-error", () => ({ toastError: vi.fn() }));

const writeText = vi.fn<(text: string) => Promise<void>>();
Object.defineProperty(navigator, "clipboard", { value: { writeText } });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

const copyButton = () => container.querySelector<HTMLButtonElement>("button");

beforeEach(() => {
	root = createRoot(container);
	act(() => root.render(<ErrorMessage message="Runware: refused" />));
});

afterEach(() => act(() => root.unmount()));

describe("ErrorMessage copy", () => {
	it("confirms a copy that landed", async () => {
		writeText.mockResolvedValue(undefined);

		await act(async () => copyButton()?.click());

		expect(writeText).toHaveBeenCalledWith("Runware: refused");
		expect(copyButton()?.getAttribute("aria-label")).toBe("Copied");
	});

	it("tells the user when the clipboard refuses", async () => {
		const refused = new Error("Document is not focused");
		writeText.mockRejectedValue(refused);

		await act(async () => copyButton()?.click());

		expect(toastError).toHaveBeenCalledWith(refused, "Couldn't copy the error");
		expect(copyButton()?.getAttribute("aria-label")).toBe("Copy error message");
	});
});
