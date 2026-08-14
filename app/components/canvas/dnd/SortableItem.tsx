import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RenderElementProps } from "slate-react";
import type { CanvasElement } from "@/lib/canvas/types";
import styles from "../styles/sortable.module.css";
import { splitTextDirection } from "../utils/textDirection";
import { DragHandle } from "./SortableActions";

// Drag start re-renders every sortable, so `children` and `insertMenu` are
// built by the caller: constructing them here rebuilds N card subtrees.
interface SortableItemProps {
	sceneId: string;
	sortableType: "scene" | "content";
	wrapperClassName?: string;
	wrapperStyle?: React.CSSProperties;
	contentClassName?: string;
	insertMenu?: React.ReactNode;
	menuOpen?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	attributes: RenderElementProps["attributes"];
	element: CanvasElement;
	children: React.ReactNode;
}

export function SortableItem({
	sceneId,
	sortableType,
	wrapperClassName,
	wrapperStyle,
	contentClassName,
	insertMenu,
	menuOpen,
	disabled,
	readOnly,
	attributes,
	element,
	children,
}: SortableItemProps) {
	const {
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isSorting,
		attributes: sortableAttributes,
	} = useSortable({
		id: element.id,
		data: { type: sortableType, sceneId },
		disabled,
	});

	const { nodeAttributes } = splitTextDirection(attributes);

	return (
		<div {...nodeAttributes} className={wrapperClassName} style={wrapperStyle}>
			<div
				className={
					contentClassName
						? `${styles.sortable} ${contentClassName}`
						: styles.sortable
				}
				{...sortableAttributes}
				ref={setNodeRef}
				style={{
					transition,
					transform: CSS.Transform.toString(transform),
					pointerEvents: isSorting ? "none" : undefined,
					opacity: isDragging ? 0 : 1,
				}}
			>
				<div
					className={`${styles.hoverTarget} align-middle${menuOpen ? ` ${styles.menuOpen}` : ""}`}
				>
					{!disabled && (
						<div
							className={`self-center ${styles.actions}`}
							contentEditable={false}
						>
							{insertMenu}
							<DragHandle listeners={listeners} />
						</div>
					)}
					<div contentEditable={readOnly ? false : undefined}>{children}</div>
				</div>
			</div>
		</div>
	);
}
