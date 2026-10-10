import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RenderElementProps } from "slate-react";
import type { SortableData } from "@/lib/canvas/drag-ops";
import type { CanvasBlock } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import styles from "../styles/sortable.module.css";
import { splitTextDirection } from "../utils/text-direction";
import { DragHandle } from "./sortable-actions";

// Drag start re-renders every sortable, so `children` and `insertMenu` are
// built by the caller: constructing them here rebuilds N card subtrees.
interface SortableItemProps {
	sceneId: string;
	sortableType: SortableData["type"];
	wrapperClassName?: string;
	wrapperStyle?: React.CSSProperties;
	innerClassName?: string;
	insertMenu?: React.ReactNode;
	menuOpen?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	attributes: RenderElementProps["attributes"];
	block: CanvasBlock;
	children: React.ReactNode;
}

export function SortableItem({
	sceneId,
	sortableType,
	wrapperClassName,
	wrapperStyle,
	innerClassName,
	insertMenu,
	menuOpen,
	disabled,
	readOnly,
	attributes,
	block,
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
		id: block.id,
		data: { type: sortableType, sceneId } satisfies SortableData,
		disabled,
	});

	const { nodeAttributes } = splitTextDirection(attributes);

	return (
		<div {...nodeAttributes} className={wrapperClassName} style={wrapperStyle}>
			<div
				className={cn(styles.sortable, innerClassName)}
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
