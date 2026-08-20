import type { RenderElementProps } from "slate-react";

/**
 * Slate marks blocks whose text reads right-to-left with `dir` on the node
 * attributes. Spread onto a card's outer element it mirrors the entire layout,
 * so the two are kept apart: chrome stays left-to-right, and `dir` is applied
 * to whichever element wraps the text itself.
 */
export function splitTextDirection({
	dir,
	...nodeAttributes
}: RenderElementProps["attributes"]) {
	return { dir, nodeAttributes };
}
