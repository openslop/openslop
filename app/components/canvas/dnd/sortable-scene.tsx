import { RenderElementProps } from "slate-react";
import type { Scene } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import {
	ACTIVE_SCENE_CLASS,
	useIsActiveScene,
} from "@/app/components/scene-selection/active-scene-context";
import { useSceneCollapsed } from "../view-mode-context";
import styles from "../styles/sortable.module.css";
import { SceneContainer } from "../elements/scene-container";
import { useSceneIndex } from "../hooks/use-scene-index";
import { SortableItem } from "./sortable-item";

export function SortableScene({
	attributes,
	scene,
	children,
}: {
	attributes: RenderElementProps["attributes"];
	scene: Scene;
	children: React.ReactNode;
}) {
	const isActive = useIsActiveScene(scene.id);
	const collapsed = useSceneCollapsed(scene.id);
	const sceneIndex = useSceneIndex(scene.id);
	return (
		<SortableItem
			sceneId={scene.id}
			sortableType="scene"
			disabled={!collapsed}
			wrapperClassName={`border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0 ${isActive ? "border-transparent" : "border-border"}`}
			innerClassName={cn(styles.scene, isActive && ACTIVE_SCENE_CLASS)}
			attributes={attributes}
			block={scene}
		>
			<SceneContainer
				attributes={attributes}
				scene={scene}
				sceneIndex={sceneIndex}
			>
				{children}
			</SceneContainer>
		</SortableItem>
	);
}
