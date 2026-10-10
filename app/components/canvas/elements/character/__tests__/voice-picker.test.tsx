// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { VoiceInfo } from "@/lib/connectors/types";
import { VoiceRow } from "../voice-picker";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const VOICE: VoiceInfo = {
	id: "v1",
	name: "Aria",
	language: "en",
	description: "Warm narrator",
	previewUrl: "https://vendor/aria.mp3",
};

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
const onSelect = vi.fn();
const loadPreview = vi.fn(() => new Promise<string>(() => {}));

beforeEach(() => {
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	vi.clearAllMocks();
});

const render = (selected: boolean, voice: VoiceInfo = VOICE) =>
	act(() =>
		root.render(
			<TooltipProvider>
				<VoiceRow
					voice={voice}
					selected={selected}
					onSelect={onSelect}
					loadPreview={loadPreview}
				/>
			</TooltipProvider>,
		),
	);

const button = (name: string) => {
	const found = container.querySelector<HTMLButtonElement>(name);
	if (!found) throw new Error(`no ${name}`);
	return found;
};
const selectButton = () => button("button[aria-pressed]");
const previewButton = () => button('button[aria-label="Play"]');

describe("VoiceRow", () => {
	it("says whether its voice is the selected one", () => {
		render(false);
		expect(selectButton().getAttribute("aria-pressed")).toBe("false");

		render(true);
		expect(selectButton().getAttribute("aria-pressed")).toBe("true");
	});

	it("offers no preview for a voice the vendor has none of", () => {
		render(false, { ...VOICE, previewUrl: undefined });

		expect(container.querySelector('button[aria-label="Play"]')).toBeNull();
	});

	it("selects the voice from the row's own button", () => {
		render(false);

		act(() => selectButton().click());

		expect(onSelect).toHaveBeenCalledOnce();
	});

	it("previews a voice without selecting it", () => {
		render(false);

		act(() => previewButton().click());

		expect(selectButton().contains(previewButton())).toBe(false);
		expect(loadPreview).toHaveBeenCalledOnce();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("ignores a second press while the preview loads", () => {
		render(false);

		act(() => previewButton().click());
		act(() => previewButton().click());

		expect(previewButton().getAttribute("aria-disabled")).toBe("true");
		expect(loadPreview).toHaveBeenCalledOnce();
	});
});
