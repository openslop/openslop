// @vitest-environment happy-dom

import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleProjectHistoryKeyDown } from "../project-history-keymap";

const containers: HTMLElement[] = [];

afterEach(() => {
	for (const container of containers.splice(0)) container.remove();
	vi.restoreAllMocks();
});

function mountHistoryKeymap() {
	const editor = withHistory(createEditor());
	const undo = vi.spyOn(editor, "undo").mockImplementation(() => {});
	const redo = vi.spyOn(editor, "redo").mockImplementation(() => {});
	const boundary = document.createElement("div");
	boundary.addEventListener("keydown", (event) =>
		handleProjectHistoryKeyDown(event, editor),
	);
	document.body.append(boundary);
	containers.push(boundary);
	return { boundary, editor, undo, redo };
}

function press(
	target: HTMLElement,
	key: string,
	modifiers: Partial<
		Pick<
			KeyboardEvent,
			"ctrlKey" | "metaKey" | "shiftKey" | "altKey" | "isComposing"
		>
	> = {},
) {
	const event = new KeyboardEvent("keydown", {
		key,
		bubbles: true,
		cancelable: true,
		...modifiers,
	});
	target.dispatchEvent(event);
	return event;
}

describe("project history keymap", () => {
	it("undoes from other project surfaces and supports the platform redo shortcuts", () => {
		const { boundary, undo, redo } = mountHistoryKeymap();
		const button = document.createElement("button");
		boundary.append(button);

		expect(press(button, "z", { metaKey: true }).defaultPrevented).toBe(true);
		expect(undo).toHaveBeenCalledTimes(1);

		press(button, "z", { metaKey: true, shiftKey: true });
		press(button, "y", { ctrlKey: true });
		expect(redo).toHaveBeenCalledTimes(2);
	});

	it("leaves native text fields and editable content alone", () => {
		const { boundary, undo } = mountHistoryKeymap();
		const input = document.createElement("input");
		const editable = document.createElement("div");
		editable.contentEditable = "true";
		boundary.append(input, editable);

		expect(press(input, "z", { ctrlKey: true }).defaultPrevented).toBe(false);
		expect(press(editable, "z", { ctrlKey: true }).defaultPrevented).toBe(
			false,
		);
		expect(undo).not.toHaveBeenCalled();
	});

	it("lets the Slate editor handle its own shortcut once", () => {
		const { boundary, editor, undo } = mountHistoryKeymap();
		const editable = document.createElement("div");
		editable.contentEditable = "true";
		editable.setAttribute("data-slate-editor", "true");
		editable.addEventListener("keydown", (event) => {
			event.preventDefault();
			editor.undo();
		});
		boundary.append(editable);

		expect(press(editable, "z", { ctrlKey: true }).defaultPrevented).toBe(true);
		expect(undo).toHaveBeenCalledTimes(1);
	});

	it("does not take shortcuts already claimed by another handler or the OS", () => {
		const { boundary, undo, redo } = mountHistoryKeymap();
		const button = document.createElement("button");
		boundary.append(button);
		button.addEventListener("keydown", (event) => event.preventDefault());

		press(button, "z", { ctrlKey: true });
		press(button, "z", { ctrlKey: true, altKey: true });
		press(button, "z", { ctrlKey: true, isComposing: true });
		expect(undo).not.toHaveBeenCalled();
		expect(redo).not.toHaveBeenCalled();
	});
});
