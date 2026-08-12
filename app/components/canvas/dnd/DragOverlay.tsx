import { GripVertical, Plus } from "@/components/ui/icon";
import { useCallback, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, RenderElementProps, Slate, withReact } from "slate-react";
import type { CanvasElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { CompactElement } from "../elements/CompactElement";
import { ElementContainer } from "../elements/ElementContainer";
import { SceneContainer } from "../elements/SceneContainer";
import { useSceneIndex } from "../hooks/useSceneIndex";
import { useIsCollapsed } from "../ViewModeContext";
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
	const sceneCollapsed = useIsCollapsed(element.id);
	const collapsed = isSceneElement(element) && sceneCollapsed;

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
				<div className={styles.actions}>
					<button
						aria-label="Add element"
						className="inline-flex items-center rounded-md p-0.5 text-foreground"
					>
						<Plus size={18} />
					</button>
					<button
						aria-label="Drag handle"
						className="inline-flex items-center rounded-md p-0.5 text-foreground"
					>
						<GripVertical size={22} />
					</button>
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
