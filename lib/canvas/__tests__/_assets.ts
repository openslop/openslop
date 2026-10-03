import { assetId } from "../types";
import { createCanvasNode } from "../createCanvasNode";
import type { AssetElement, AssetType } from "../types";

/** An asset as the canvas holds it: under its fixed id, named when it belongs to a character. */
export const asset = <T extends AssetType>(
	type: T,
	{
		name,
		attrs = {},
		text,
	}: { name?: string; attrs?: Record<string, string>; text?: string } = {},
): AssetElement<T> =>
	createCanvasNode(type, {
		id: assetId(type, name),
		attrs: name ? { name, ...attrs } : attrs,
		text,
	});

export const references = (...urls: string[]) =>
	asset("references", { attrs: { images: urls.join(",") } });
