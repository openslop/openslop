// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";
import { Editable, type RenderElementProps } from "slate-react";
import type { ContentElement } from "@/lib/canvas/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { content } from "../../__tests__/fixtures";
import { click, mountOnCanvas } from "../../__tests__/_mount";
import { ElementInput } from "../element-input";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const UNLOCK = "button";

let canvas: ReturnType<typeof mountOnCanvas>;

function mount(uploaded: boolean) {
	canvas = mountOnCanvas([content("image", "i", "a red fox")]);
	const renderElement = ({
		attributes,
		children,
		element,
	}: RenderElementProps) => (
		<div {...attributes}>
			<ElementInput element={element as ContentElement} uploaded={uploaded}>
				{children}
			</ElementInput>
		</div>
	);
	return canvas.render(
		<TooltipProvider>
			<Editable renderElement={renderElement} />
		</TooltipProvider>,
	);
}

const prompt = () => document.body.querySelector("[aria-readonly]");
const unlockButton = () =>
	Array.from(document.body.querySelectorAll(UNLOCK)).find(
		(button) => button.textContent === "Unlock",
	);

afterEach(() => canvas.unmount());

describe("ElementInput", () => {
	it("leaves a generated element's prompt editable, with no lock", async () => {
		await mount(false);

		expect(prompt()).toBeNull();
		expect(unlockButton()).toBeUndefined();
		expect(document.body.textContent).toContain("a red fox");
	});

	it("locks an uploaded element's prompt and says why", async () => {
		await mount(true);

		expect(prompt()?.getAttribute("contenteditable")).toBe("false");
		expect(prompt()?.textContent).toContain("a red fox");
		expect(unlockButton()).toBeDefined();
	});

	it("unlocks for editing from the lock, with the caret at the prompt's end", async () => {
		await mount(true);

		await click(UNLOCK);

		expect(prompt()).toBeNull();
		expect(unlockButton()).toBeUndefined();
		expect(canvas.editor.selection?.anchor).toEqual({
			path: [0, 0],
			offset: "a red fox".length,
		});
	});
});
