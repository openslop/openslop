// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CanvasEditor } from "@/lib/canvas/types";
import { useProjectHistoryHotkeys } from "../project-history-keymap";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];
const containers: HTMLElement[] = [];

afterEach(() => {
	for (const root of roots.splice(0)) act(() => root.unmount());
	for (const container of containers.splice(0)) container.remove();
});

function ProjectHistoryHotkeys({ editor }: { editor: CanvasEditor }) {
	useProjectHistoryHotkeys(editor);
	return null;
}

function mountHistoryKeymap() {
	const editor = withHistory(withReact(createEditor()));
	editor.defaultModels = () => ({});
	editor.children = [
		{
			id: "scene-1",
			type: "scene",
			children: [
				{
					id: "narration-1",
					type: "narration",
					children: [{ id: "text-1", type: "narration", text: "" }],
				},
			],
		},
	];
	const undo = vi.spyOn(editor, "undo").mockImplementation(() => {});
	const redo = vi.spyOn(editor, "redo").mockImplementation(() => {});
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	roots.push(root);
	containers.push(container);
	act(() =>
		root.render(
			<Slate editor={editor} initialValue={editor.children}>
				<ProjectHistoryHotkeys editor={editor} />
				<Editable />
			</Slate>,
		),
	);
	return { container, editor, undo, redo };
}

function platformModifier() {
	return /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
		? { metaKey: true }
		: { ctrlKey: true };
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
	Object.defineProperty(event, "which", {
		value: key.toUpperCase().charCodeAt(0),
	});
	act(() => target.dispatchEvent(event));
	return event;
}

describe("project history keymap", () => {
	it("undoes from page controls and supports platform redo shortcuts", () => {
		const { undo, redo } = mountHistoryKeymap();
		const button = document.body.appendChild(document.createElement("button"));
		containers.push(button);
		const mod = platformModifier();

		expect(press(button, "z", mod).defaultPrevented).toBe(true);
		expect(undo).toHaveBeenCalledTimes(1);

		press(button, "z", { ...mod, shiftKey: true });
		press(button, "y", mod);
		expect(redo).toHaveBeenCalledTimes(2);
	});

	it("leaves native text fields and editable content alone", () => {
		const { undo } = mountHistoryKeymap();
		const input = document.body.appendChild(document.createElement("input"));
		const textarea = document.body.appendChild(
			document.createElement("textarea"),
		);
		const editable = document.body.appendChild(document.createElement("div"));
		containers.push(input, textarea, editable);
		editable.contentEditable = "true";
		const mod = platformModifier();

		expect(press(input, "z", mod).defaultPrevented).toBe(false);
		expect(press(textarea, "z", mod).defaultPrevented).toBe(false);
		expect(press(editable, "z", mod).defaultPrevented).toBe(false);
		expect(undo).not.toHaveBeenCalled();
	});

	it("does not treat non-text input controls as text entry", () => {
		const { undo } = mountHistoryKeymap();
		const checkbox = document.body.appendChild(document.createElement("input"));
		checkbox.type = "checkbox";
		containers.push(checkbox);

		expect(press(checkbox, "z", platformModifier()).defaultPrevented).toBe(
			true,
		);
		expect(undo).toHaveBeenCalledTimes(1);
	});

	it("handles controls inside contenteditable=false Slate islands", () => {
		const { container, undo } = mountHistoryKeymap();
		const slateEditor = container.querySelector<HTMLElement>(
			"[data-slate-editor]",
		);
		if (!slateEditor) throw new Error("Slate editable surface was not mounted");
		const island = document.createElement("div");
		island.contentEditable = "false";
		const button = document.createElement("button");
		island.append(button);
		slateEditor.append(island);

		expect(press(button, "z", platformModifier()).defaultPrevented).toBe(true);
		expect(undo).toHaveBeenCalledTimes(1);
	});

	it("lets Slate and earlier handlers claim a shortcut once", () => {
		const { container, undo, redo } = mountHistoryKeymap();
		const slateEditor = container.querySelector<HTMLElement>(
			"[data-slate-editor]",
		);
		if (!slateEditor) throw new Error("Slate editable surface was not mounted");
		const button = document.body.appendChild(document.createElement("button"));
		containers.push(button);
		button.addEventListener("keydown", (event) => event.preventDefault());
		const mod = platformModifier();

		press(slateEditor, "z", mod);
		press(button, "z", mod);
		press(button, "z", { ...mod, altKey: true });
		press(button, "z", { ...mod, isComposing: true });
		expect(undo).toHaveBeenCalledTimes(1);
		expect(redo).not.toHaveBeenCalled();
	});
});
