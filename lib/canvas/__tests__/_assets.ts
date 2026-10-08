import { assetId } from "../types";
import { createCanvasElement } from "../createCanvasElement";
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
	createCanvasElement(type, {
		id: assetId(type, name),
		attrs: name ? { name, ...attrs } : attrs,
		text,
	});

export const references = (...urls: string[]) =>
	asset("asset_references", { attrs: { images: urls.join(",") } });
