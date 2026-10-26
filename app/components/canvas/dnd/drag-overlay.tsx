import { GripVertical, Plus } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
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
import { renderCanvasElement } from "../render-canvas-element";
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
					<IconButton ariaLabel="Add element">
						<Plus size={18} />
					</IconButton>
					<IconButton ariaLabel="Drag handle">
						<GripVertical size={22} />
					</IconButton>
				</div>
				<Editable
					readOnly={true}
					renderElement={renderElement}
					className="font-body text-body leading-relaxed text-center break-all"
				/>
			</Slate>
		</div>
	);
}
