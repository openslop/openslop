// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { findAsset } from "@/lib/canvas/assets";
import { updateElementText } from "@/lib/canvas/editor-ops";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { useAsset } from "@/lib/canvas/use-assets";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { DraftPrompt } from "../draft-prompt";

vi.hoisted(() => {
	// happy-dom lacks getTargetRanges, which Slate needs to listen for beforeinput.
	Object.assign(InputEvent.prototype, { getTargetRanges: () => [] });
});

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const DRAFT = "asset_media_image";

function Prompt() {
	const draft = useAsset(DRAFT);
	return draft && <DraftPrompt draft={draft} />;
}

let canvas: ReturnType<typeof mountOnCanvas>;

const box = () => {
	const editable = document.body.querySelector<HTMLElement>(
		'[aria-label="Prompt"]',
	);
	if (!editable) throw new Error("the prompt box is missing");
	return editable;
};

const draftText = () => {
	const draft = findAsset(canvas.editor.children, DRAFT);
	return draft && getElementBodyText(draft);
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

function placeCaretAtEnd(editable: HTMLElement) {
	const text = editable.querySelector("[data-slate-string]")?.firstChild;
	if (!text?.textContent) throw new Error("the prompt box has no text");
	editable.focus();
	document.getSelection()?.collapse(text, text.textContent.length);
	document.dispatchEvent(new Event("selectionchange"));
}

/** A keystroke as the browser delivers it: React reads `window.event` and renders at once. */
async function typeKey(data: string) {
	const editable = box();
	placeCaretAtEnd(editable);
	const event = new InputEvent("input", { inputType: "insertText", data });
	Object.defineProperty(window, "event", {
		configurable: true,
		get: () => event,
	});
	editable.dispatchEvent(
		new InputEvent("beforeinput", {
			inputType: "insertText",
			data,
			bubbles: true,
			cancelable: true,
		}),
	);
	editable.dispatchEvent(
		new InputEvent("input", { inputType: "insertText", data, bubbles: true }),
	);
	await settle();
	Object.defineProperty(window, "event", {
		configurable: true,
		get: () => undefined,
	});
	await settle();
}

beforeEach(async () => {
	canvas = mountOnCanvas([asset(DRAFT)]);
	canvas.render(<Prompt />);
	await act(settle);
	Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false });
});

afterEach(() => {
	Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
	canvas.unmount();
});

describe("DraftPrompt", () => {
	it("keeps the box and its focus while every keystroke lands in the draft", async () => {
		const typedInto = box();

		for (const key of ["a", "b", "c"]) await typeKey(key);

		expect(draftText()).toBe("abc");
		expect(box()).toBe(typedInto);
		expect(document.activeElement).toBe(typedInto);
	});

	it("rebuilds the box with a prompt set from outside", async () => {
		const before = box();
		const draft = findAsset(canvas.editor.children, DRAFT);
		if (!draft) throw new Error("the draft is missing");

		updateElementText(canvas.editor, draft.id, "a red fox");
		await settle();

		expect(box()).not.toBe(before);
		expect(box().textContent).toContain("a red fox");
	});
});
