import { useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate } from "slate-react";
import type { CanvasBlock } from "@/lib/canvas/types";
import { useAssets } from "@/lib/canvas/use-assets";
import { CompactElement } from "../elements/compact-element";
import { ElementContainer } from "../elements/element-container";
import { SceneContainer } from "../elements/scene-container";
import { useSceneIndex } from "../hooks/use-scene-index";
import { withCanvas } from "../plugins/with-canvas";
import { DragHandle, InsertButton } from "./sortable-actions";
import {
	CANVAS_TEXT_CLASS,
	renderCanvasElement,
} from "../render-canvas-element";
import { useSceneCollapsed } from "../view-mode-context";
import styles from "../styles/sortable.module.css";

/** Previews the dragged node in a scratch canvas holding it and the assets its chips resolve against. */
export function DragOverlayPreview({ block }: { block: CanvasBlock }) {
	const assets = useAssets();
	const editor = useMemo(() => withCanvas(createEditor()), []);
	const value = useMemo<Descendant[]>(
		() => structuredClone([...assets, block]),
		[assets, block],
	);

	const sceneIndex = useSceneIndex(block.id);
	const collapsed = useSceneCollapsed(block.id);

	const renderElement = useMemo(
		() =>
			renderCanvasElement({
				Scene: ({ attributes, scene, children }) => (
					<SceneContainer
						attributes={attributes}
						scene={scene}
						sceneIndex={sceneIndex}
					>
						{children}
					</SceneContainer>
				),
				Content: collapsed ? CompactElement : ElementContainer,
			}),
		[collapsed, sceneIndex],
	);

	return (
		<div className={styles.dragOverlay}>
			<Slate editor={editor} initialValue={value}>
				<div className={styles.actions} aria-hidden>
					<InsertButton />
					<DragHandle />
				</div>
				<Editable
					readOnly={true}
					renderElement={renderElement}
					className={`${CANVAS_TEXT_CLASS} text-center break-all`}
				/>
			</Slate>
		</div>
	);
}
