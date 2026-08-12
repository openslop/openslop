import { RenderElementProps } from "slate-react";
import type { SceneElement } from "@/lib/canvas/types";
import { useActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { useIsCollapsed } from "../ViewModeContext";
import styles from "../styles/sortable.module.css";
import { SceneContainer } from "../elements/SceneContainer";
import { useSceneIndex } from "../hooks/useSceneIndex";
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
	const collapsed = useIsCollapsed(element.id);
	const sceneIndex = useSceneIndex(element.id);
	return (
		<SortableItem
			sceneId={element.id}
			sortableType="scene"
			disabled={!collapsed}
			wrapperClassName={`${styles.scene} border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0 ${isActive ? "border-transparent" : "border-border"}`}
			contentClassName={isActive ? ACTIVE_SCENE_CLASS : undefined}
			attributes={attributes}
			element={element}
		>
			<SceneContainer
				attributes={attributes}
				element={element}
				sceneIndex={sceneIndex}
			>
				{children}
			</SceneContainer>
		</SortableItem>
	);
}
