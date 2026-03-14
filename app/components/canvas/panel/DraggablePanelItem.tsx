import { useDraggable } from "@dnd-kit/core";
import { ElementConfig } from "../config/elementConfigs";
import { PanelItem } from "./PanelItem";

interface DraggablePanelItemProps {
  item: ElementConfig;
  hoveredItem: string | null;
}

export function DraggablePanelItem({
  item,
  hoveredItem,
}: DraggablePanelItemProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
  });

  return (
    <PanelItem
      item={item}
      isHovered={hoveredItem === item.id}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    />
  );
}
