import compact from "lodash/compact";
import { createCanvasElement } from "../createCanvasElement";
import { isAssetElement } from "../guards";
import type { AssetElement, AssetType } from "../types";

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
