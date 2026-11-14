// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { Editable, type RenderElementProps } from "slate-react";
import type { ContentElement } from "@/lib/canvas/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { content } from "../../__tests__/fixtures";
import { click, mountOnCanvas } from "../../__tests__/_mount";
import type { AssetResult } from "@/lib/connectors/types";
import { ElementPrompt } from "../element-input";

let result: AssetResult | null = null;
vi.mock("../element-generation-context", () => ({
	useElementGeneration: () => ({ result }),
}));

const upload = (imageUrl: string): AssetResult => ({
	imageUrl,
	durationSec: 0,
	uploaded: true,
});

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const UNLOCK = "button";

let canvas: ReturnType<typeof mountOnCanvas>;

function mount(shown: AssetResult | null = null) {
	canvas = mountOnCanvas([content("image", "i", "a red fox")]);
	return show(shown);
}

function show(shown: AssetResult | null) {
	result = shown;
	const renderElement = ({
		attributes,
		children,
		element,
	}: RenderElementProps) => (
		<div {...attributes}>
			<ElementPrompt element={element as ContentElement}>
				{children}
			</ElementPrompt>
		</div>
	);
	return canvas.render(
		<TooltipProvider>
			<Editable renderElement={renderElement} />
		</TooltipProvider>,
	);
}

const lockedPrompt = () =>
	document.body.querySelector('[contenteditable="false"]');
const unlockButton = () =>
	Array.from(document.body.querySelectorAll(UNLOCK)).find(
		(button) => button.textContent === "Unlock",
	);

afterEach(() => canvas.unmount());

describe("ElementPrompt", () => {
	it("leaves a generated element's prompt editable, with no lock", async () => {
		await mount({ imageUrl: "fox.png", durationSec: 0 });

		expect(lockedPrompt()).toBeNull();
		expect(unlockButton()).toBeUndefined();
		expect(document.body.textContent).toContain("a red fox");
	});

	it("locks an uploaded element's prompt and says why", async () => {
		await mount(upload("fox.png"));

		expect(lockedPrompt()?.textContent).toContain("a red fox");
		expect(unlockButton()).toBeDefined();
	});

	it("unlocks for editing from the lock, with the caret at the prompt's end", async () => {
		await mount(upload("fox.png"));

		await click(UNLOCK);

		expect(lockedPrompt()).toBeNull();
		expect(unlockButton()).toBeUndefined();
		expect(canvas.editor.selection?.anchor).toEqual({
			path: [0, 0],
			offset: "a red fox".length,
		});
	});

	it("stays unlocked while the same upload re-renders", async () => {
		await mount(upload("fox.png"));
		await click(UNLOCK);

		await show(upload("fox.png"));

		expect(lockedPrompt()).toBeNull();
	});

	it("locks again when a different file is uploaded over the unlocked one", async () => {
		await mount(upload("fox.png"));
		await click(UNLOCK);

		await show(upload("wolf.png"));

		expect(lockedPrompt()).not.toBeNull();
		expect(unlockButton()).toBeDefined();
	});
});
