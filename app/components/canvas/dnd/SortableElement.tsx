import { useCallback, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { CanvasElement, CanvasElementType } from "../types";
import { ELEMENT_LIST } from "../config/elementConfigs";
import { insertElement } from "../utils/insertElement";
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
  const editor = useSlateStatic();
  const { connectorDefaults } = useConfig();
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showActions = isHovered || isMenuOpen;

  const handleMouseOver = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleInsert = useCallback(
    (type: CanvasElementType) => {
      const path = ReactEditor.findPath(editor, element);
      insertElement(editor, type, path[0] + 1, connectorDefaults);
      setIsHovered(false);
    },
    [connectorDefaults, editor, element],
  );

  return (
    <div {...attributes}>
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
          className={`${styles.sortable} align-middle`}
          onMouseEnter={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`self-center ${styles.actions}`}
            style={{
              opacity: showActions ? 1 : 0,
              pointerEvents: showActions ? "auto" : "none",
            }}
            contentEditable={false}
          >
            <DropdownMenu modal={false} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Add element"
                  className="inline-flex items-center rounded-md p-0.5 text-white/40
                  hover:text-white/80 hover:bg-white/10 transition-[color,background-color] duration-200"
                >
                  <Plus size={24} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="start"
                className="w-40 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-1"
              >
                {ELEMENT_LIST.map((config) => (
                  <DropdownMenuItem
                    key={config.type}
                    onClick={() => handleInsert(config.type)}
                    className="cursor-pointer rounded-lg py-2 text-white/70 hover:bg-white/10 hover:text-white focus:text-white focus:bg-white/10"
                  >
                    <span
                      className={`${config.bgColor} inline-flex items-center justify-center rounded p-1 mr-1`}
                    >
                      {config.icon}
                    </span>
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              aria-label="Drag to reorder"
              className="inline-flex items-center rounded-md p-0.5 text-white/40
              hover:text-white/80 hover:bg-white/10 transition-[color,background-color] duration-200
              cursor-grab active:cursor-grabbing"
              {...listeners}
            >
              <GripVertical size={24} />
            </button>
          </div>
          <div>{renderElement({ attributes, children, element })}</div>
        </div>
      </div>
    </div>
  );
}
