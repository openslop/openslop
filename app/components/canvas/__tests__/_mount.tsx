import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createEditor, type Descendant } from "slate";
import { Slate, withReact } from "slate-react";
import type { ElementVersionStorage } from "@/lib/generation/history";

const untouched = () => Promise.reject(new Error("this test reads no history"));

/** Generation history storage for a test that never reads or writes it. */
export const noHistory: ElementVersionStorage = {
	read: untouched,
	write: untouched,
};

/** A canvas with no editable surface, as an asset dialog sees it. */
export function mountOnCanvas(children: Descendant[] = []) {
	const editor = withReact(createEditor());
	editor.defaultModels = () => ({});
	editor.children = children;
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	return {
		editor,
		render: (ui: ReactNode) =>
			act(() =>
				root.render(
					<Slate editor={editor} initialValue={editor.children}>
						{ui}
					</Slate>,
				),
			),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

/** Clicks and lets the document change reach the components reading it. */
export const click = (selector: string) =>
	act(async () => {
		const target = document.body.querySelector<HTMLElement>(selector);
		if (!target) throw new Error(`nothing matches ${selector}`);
		target.click();
	});

/** Opens the ⋮ menu of the tile named `tile` and chooses the item reading `item`. */
export async function chooseTileMenuItem(tile: string, item: string) {
	await act(async () => {
		const trigger = document.body.querySelector(
			`button[aria-label="More actions for ${tile}"]`,
		);
		if (!trigger) throw new Error(`no menu for ${tile}`);
		trigger.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
	});
	await act(async () => {
		const found = Array.from(
			document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
		).find((element) => element.textContent === item);
		if (!found) throw new Error(`no menu item reads ${item}`);
		found.click();
	});
}

/** Types into a controlled field the way a browser reports it to React. */
export const type = (
	field: HTMLInputElement | HTMLTextAreaElement,
	value: string,
) =>
	act(async () => {
		const prototype = Object.getPrototypeOf(field) as object;
		Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(
			field,
			value,
		);
		field.dispatchEvent(new Event("input", { bubbles: true }));
	});
