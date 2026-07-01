import { RenderElementProps } from "slate-react";
import type { SceneElement } from "@/lib/canvas/types";
import { useActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { useViewMode } from "../ViewModeContext";
import { SortableItem } from "./SortableItem";

const ACTIVE_SCENE_CLASS = "scene-active bg-element-card";

export function SortableScene({
	attributes,
	element,
	children,
}: {
	attributes: RenderElementProps["attributes"];
	element: SceneElement;
	children: React.ReactNode;
}) {
	const isActive = useActiveSceneId() === element.id;
	const { isCollapsed } = useViewMode();
	return (
		<SortableItem
			sceneId={element.id}
			sortableType="scene"
			disabled={!isCollapsed(element.id)}
			wrapperClassName={`border-t border-border pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0 ${isActive ? ACTIVE_SCENE_CLASS : ""}`}
			attributes={attributes}
			element={element}
		>
			{children}
		</SortableItem>
	);
}
