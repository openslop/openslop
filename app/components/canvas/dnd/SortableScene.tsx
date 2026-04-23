import { RenderElementProps } from "slate-react";
import type { SceneElement } from "../types";
import { SortableItem } from "./SortableItem";

export function SortableScene({
	attributes,
	element,
	children,
	renderElement,
}: {
	attributes: RenderElementProps["attributes"];
	element: SceneElement;
	children: React.ReactNode;
	renderElement: (props: RenderElementProps) => React.ReactNode;
}) {
	return (
		<SortableItem
			sceneId={element.id}
			sortableType="scene"
			wrapperClassName="border-t border-white/15 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0"
			attributes={attributes}
			element={element}
			renderElement={renderElement}
		>
			{children}
		</SortableItem>
	);
}
