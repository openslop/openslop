import { useDraggable } from "@dnd-kit/core";
import { ElementConfig } from "../config/elementConfigs";
import { PanelItem } from "./PanelItem";

export function DraggablePanelItem({ item }: { item: ElementConfig }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
  });

  return (
    <PanelItem item={item} ref={setNodeRef} {...attributes} {...listeners} />
  );
}
