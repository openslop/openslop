import { useCallback, useMemo, useState } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import { Descendant, Editor, Transforms } from "slate";

export function useDragAndDrop(editor: Editor, value: Descendant[]) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const items = useMemo<UniqueIdentifier[]>(
    () => value.map((element) => element.id),
    [value],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over?.id && active.id !== over.id) {
        const newIndex = items.indexOf(over.id);
        Transforms.moveNodes(editor, {
          at: [],
          match: (node) => node.id === active.id,
          to: [newIndex],
        });
      }
      setActiveId(null);
    },
    [editor, items],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return {
    activeId,
    items,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
