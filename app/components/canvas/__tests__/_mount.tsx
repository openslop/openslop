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

const openMenuItems = () =>
	Array.from(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'));

/** Opens the ⋮ menu of the tile named `tile` and chooses the item reading `item`, through any submenus before it. */
export async function chooseTileMenuItem(tile: string, ...path: string[]) {
	await act(async () => {
		const trigger = document.body.querySelector(
			`button[aria-label="More actions for ${tile}"]`,
		);
		if (!trigger) throw new Error(`no menu for ${tile}`);
		trigger.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
	});
	for (const item of path)
		await act(async () => {
			const found = openMenuItems().find(
				(element) => element.textContent === item,
			);
			if (!found) throw new Error(`no menu item reads ${item}`);
			found.click();
		});
}

/** The labels of the items in the open menu. */
export const menuItems = () => openMenuItems().map((item) => item.textContent);

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
