import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createEditor, type Descendant } from "slate";
import { Slate, withReact } from "slate-react";

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
