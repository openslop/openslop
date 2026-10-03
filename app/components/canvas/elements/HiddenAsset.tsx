import type { RenderElementProps } from "slate-react";

/** An asset is on the document for the editor to hold; its tile is what shows it. */
export function HiddenAsset({
	attributes,
	children,
}: Pick<RenderElementProps, "attributes" | "children">) {
	return (
		<div {...attributes} hidden contentEditable={false}>
			{children}
		</div>
	);
}
