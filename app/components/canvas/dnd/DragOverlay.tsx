import { GripVertical, Plus } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { useCallback, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, RenderElementProps, Slate, withReact } from "slate-react";
import type { CanvasBlock } from "@/lib/canvas/types";
import { isContentElement } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { CompactElement } from "../elements/CompactElement";
import { ElementContainer } from "../elements/ElementContainer";
import { SceneContainer } from "../elements/SceneContainer";
import { useSceneIndex } from "../hooks/useSceneIndex";
import { useSceneCollapsed } from "../ViewModeContext";
import styles from "../styles/sortable.module.css";

/**
 * Previews the dragged node in a scratch editor holding only that node. What a
 * node would otherwise read off its own document (scene number, collapsed
 * state, its generation graph) is resolved against the real canvas, which
 * this renders inside of.
 */
export function DragOverlayPreview({ block }: { block: CanvasBlock }) {
	const editor = useMemo(() => withReact(createEditor()), []);
	const value = useMemo<Descendant[]>(() => [structuredClone(block)], [block]);

	const sceneIndex = useSceneIndex(block.id);
	const collapsed = useSceneCollapsed(block.id);

	const renderElement = useCallback(
		({ attributes, children, element: node }: RenderElementProps) => {
			if (isScene(node))
				return (
					<SceneContainer
						attributes={attributes}
						scene={node}
						sceneIndex={sceneIndex}
					>
						{children}
					</SceneContainer>
				);
			if (!isContentElement(node))
				throw new Error(`A ${node.type} element is never dragged`);
			const Content = collapsed ? CompactElement : ElementContainer;
			return (
				<Content attributes={attributes} element={node}>
					{children}
				</Content>
			);
		},
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
					className="text-xl leading-relaxed text-center break-all"
				/>
			</Slate>
		</div>
	);
}
