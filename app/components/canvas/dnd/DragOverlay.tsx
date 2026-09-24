import { GripVertical, Plus } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { useCallback, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, RenderElementProps, Slate, withReact } from "slate-react";
import type { CanvasElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { CompactElement } from "../elements/CompactElement";
import { ElementContainer } from "../elements/ElementContainer";
import { SceneContainer } from "../elements/SceneContainer";
import { useSceneIndex } from "../hooks/useSceneIndex";
import { useViewMode } from "../ViewModeContext";
import styles from "../styles/sortable.module.css";

/**
 * Previews the dragged node in a scratch editor holding only that node. What a
 * node would otherwise read off its own document (scene number, collapsed
 * state) is resolved against the real canvas, which this renders inside of.
 */
export function DragOverlayContent({ element }: { element: CanvasElement }) {
	const editor = useMemo(() => withReact(createEditor()), []);
	const value = useMemo<Descendant[]>(
		() => [structuredClone(element)],
		[element],
	);

	const sceneIndex = useSceneIndex(element.id);
	const { isCollapsed } = useViewMode();
	const collapsed = isSceneElement(element) && isCollapsed(element.id);

	const renderElement = useCallback(
		({ attributes, children, element: node }: RenderElementProps) => {
			if (isSceneElement(node))
				return (
					<SceneContainer
						attributes={attributes}
						element={node}
						sceneIndex={sceneIndex}
					>
						{children}
					</SceneContainer>
				);
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
