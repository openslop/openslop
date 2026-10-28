// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { loadCaptionFonts } from "@/lib/captions/caption-fonts";
import { toastError } from "@/lib/toast-error";
import { CaptionFontLibrary } from "../caption-fonts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/captions/caption-fonts", () => ({ loadCaptionFonts: vi.fn() }));
vi.mock("@/lib/toast-error", () => ({ toastError: vi.fn() }));

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve)));

beforeEach(() => {
	root = createRoot(container);
});

afterEach(() => act(() => root.unmount()));

describe("CaptionFontLibrary", () => {
	it("tells the user when a font fails to load", async () => {
		const failure = new Error("404 Not Found");
		vi.mocked(loadCaptionFonts).mockRejectedValue(failure);

		act(() => root.render(<CaptionFontLibrary />));
		await settle();

		expect(toastError).toHaveBeenCalledWith(
			failure,
			"Couldn't load caption fonts",
		);
	});
});
