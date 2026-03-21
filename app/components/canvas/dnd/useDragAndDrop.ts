import { useCallback, useMemo, useState } from "react";
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import { Descendant, Editor, Transforms } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { CANVAS_ELEMENT_TYPES, type CanvasElementType } from "../types";
import { insertElement } from "../utils/insertElement";

export function useDragAndDrop(editor: Editor, value: Descendant[]) {
  const { connectorConfig } = useConfig();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [pendingPanelId, setPendingPanelId] = useState<UniqueIdentifier | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const baseItems = useMemo<UniqueIdentifier[]>(
    () => value.map((element) => element.id),
    [value],
  );

  const items = useMemo(
    () =>
      pendingPanelId && !baseItems.includes(pendingPanelId)
        ? [...baseItems, pendingPanelId]
        : baseItems,
    [baseItems, pendingPanelId],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const type = active.id as CanvasElementType;

      setPendingPanelId(null);

      if (
        CANVAS_ELEMENT_TYPES.has(type) &&
        over?.id &&
        !CANVAS_ELEMENT_TYPES.has(over?.id as CanvasElementType)
      ) {
        const newIndex = baseItems.indexOf(over?.id as string);
        insertElement(
          editor,
          type,
          newIndex < 0 ? editor.children.length : newIndex,
          connectorConfig,
        );
        setActiveId(null);
        return;
      }

      if (active.id !== over?.id) {
        const newIndex = baseItems.indexOf(over?.id as string);
        Transforms.moveNodes(editor, {
          at: [],
          match: (node) => node.id === active.id,
          to: [newIndex],
        });
      }
      setActiveId(null);
    },
    [baseItems, connectorConfig, editor],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setPendingPanelId(null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over, active } = event;
    if (
      CANVAS_ELEMENT_TYPES.has(active.id as CanvasElementType) &&
      over?.id &&
      !CANVAS_ELEMENT_TYPES.has(over?.id as CanvasElementType)
    ) {
      setPendingPanelId(active.id);
    }
  }, []);

  return {
    activeId,
    items,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleDragOver,
  };
}
