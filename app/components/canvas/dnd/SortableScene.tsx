import { RenderElementProps } from "slate-react";
import type { SceneElement } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import {
	ACTIVE_SCENE_CLASS,
	useActiveSceneId,
} from "@/app/components/scene-selection/ActiveSceneContext";
import { useViewMode } from "../ViewModeContext";
import styles from "../styles/sortable.module.css";
import { SceneContainer } from "../elements/SceneContainer";
import { useSceneIndex } from "../hooks/useSceneIndex";
import { SortableItem } from "./SortableItem";

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
	const sceneIndex = useSceneIndex(element.id);
	return (
		<SortableItem
			sceneId={element.id}
			sortableType="scene"
			disabled={!isCollapsed(element.id)}
			wrapperClassName={`border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0 ${isActive ? "border-transparent" : "border-border"}`}
			contentClassName={cn(styles.scene, isActive && ACTIVE_SCENE_CLASS)}
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
