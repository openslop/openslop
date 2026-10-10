import compact from "lodash/compact";
import { createEditor, type Descendant, type Editor } from "slate";
import type { ConnectorModels } from "@/lib/connectors/models";
import { createCanvasElement } from "../createCanvasElement";
import { isAssetElement, isContentElement } from "../guards";
import { splitAttributes } from "../elementAttributes";
import { getElementBodyText } from "../osmlSerializer";
import type { AssetElement, AssetType, ContentElement } from "../types";

/** An asset as the canvas holds it, named when it belongs to a character. */
export const asset = <T extends AssetType>(
	type: T,
	{
		name,
		attrs = {},
		text,
	}: { name?: string; attrs?: Record<string, string>; text?: string } = {},
): AssetElement<T> =>
	createCanvasElement(type, {
		attrs: name ? { name, ...attrs } : attrs,
		text,
	});

export const references = (...urls: string[]) =>
	asset("asset_references", { attrs: { images: urls.join(",") } });

/** A node as a test reads it: an asset by its type and name, anything else by its id. */
export const label = (node: unknown): string =>
	isAssetElement(node)
		? compact([node.type, node.generationAttributes?.name]).join(":")
		: String((node as { id?: string }).id);

export const labels = (nodes: readonly unknown[]): string[] => nodes.map(label);

export function makeEditor(
	children: Descendant[] = [],
	defaultModels: ConnectorModels = {},
): Editor {
	const editor = createEditor();
	editor.defaultModels = () => defaultModels;
	editor.children = children;
	return editor;
}

export const elements = (editor: Editor): [type: string, text: string][] =>
	editor.children
		.filter(isContentElement)
		.map((element) => [element.type, getElementBodyText(element)]);

export const element = (
	id: string,
	type: ContentElement["type"],
	text = "",
	attributes: Record<string, string> = {},
): ContentElement => ({
	id,
	type,
	...splitAttributes(attributes),
	children: [{ id: `${id}-t`, type, text }],
});
