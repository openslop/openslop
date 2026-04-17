import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RenderElementProps } from "slate-react";
import type { CanvasElement, CanvasElementType } from "../types";
import styles from "../styles/sortable.module.css";
import { SortableActions, type InsertOption } from "./SortableActions";

interface SortableItemProps {
  sceneId: string;
  sortableType: "scene" | "content";
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  insertOptions?: InsertOption<CanvasElementType>[];
  onInsert?: (type: CanvasElementType) => void;
  attributes: RenderElementProps["attributes"];
  element: CanvasElement;
  children: React.ReactNode;
  renderElement: (props: RenderElementProps) => React.ReactNode;
}

export function SortableItem({
  sceneId,
  sortableType,
  wrapperClassName,
  wrapperStyle,
  insertOptions,
  onInsert,
  attributes,
  element,
  children,
  renderElement,
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
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div {...attributes} className={wrapperClassName} style={wrapperStyle}>
      <div
        className={styles.sortable}
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
          className={`${styles.hoverTarget} align-middle${isMenuOpen ? ` ${styles.menuOpen}` : ""}`}
        >
          <div
            className={`self-center ${styles.actions}`}
            contentEditable={false}
          >
            <SortableActions
              options={insertOptions}
              onInsert={onInsert}
              listeners={listeners}
              onMenuOpenChange={setIsMenuOpen}
            />
          </div>
          <div>{renderElement({ attributes, children, element })}</div>
        </div>
      </div>
    </div>
  );
}
