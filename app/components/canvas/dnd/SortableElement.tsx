import { useCallback, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RenderElementProps } from "slate-react";
import type { CanvasElement } from "../types";
import { AddElementDivider } from "../elements/AddElementDivider";
import styles from "../styles/sortable.module.css";

export function SortableElement({
  attributes,
  element,
  children,
  renderElement,
}: {
  attributes: RenderElementProps["attributes"];
  element: CanvasElement;
  children: React.ReactNode;
  renderElement: (props: RenderElementProps) => React.ReactNode;
}) {
  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
    attributes: sortableAttributes,
  } = useSortable({ id: element.id });

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseOver = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div {...attributes}>
      <div
        className="flex flex-col"
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
          className={`${styles.sortable} align-middle`}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <button
            aria-label="Drag to reorder"
            className={`text-gray-400 hover:text-gray-200 hover:bg-white/10
            rounded-md p-1 transition-[color,background-color] duration-300 cursor-grab flex items-center
            active:cursor-grabbing ${styles.dragButton}`}
            style={{
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? "auto" : "none",
            }}
            contentEditable={false}
            {...listeners}
          >
            ⠿
          </button>
          <div>{renderElement({ attributes, children, element })}</div>
        </div>
        <AddElementDivider element={element} />
      </div>
    </div>
  );
}
