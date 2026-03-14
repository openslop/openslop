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
import { CANVAS_ELEMENT_TYPES, type CanvasElementType } from "../types";
import { makeNodeId } from "../utils/nodeUtils";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";

export function useDragAndDrop(editor: Editor, value: Descendant[]) {
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
        !CANVAS_ELEMENT_TYPES.has(over?.id as CanvasElementType)
      ) {
        const newIndex = baseItems.indexOf(over?.id as string);
        const config = ELEMENT_CONFIGS[type];
        Transforms.insertNodes(
          editor,
          {
            type,
            id: makeNodeId(),
            customAttributes: config.defaultAttributes,
            children: [
              { id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
              { id: makeNodeId(), type, text: "" },
            ],
          },
          { at: [newIndex < 0 ? editor.children.length : newIndex] },
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
    [baseItems, editor],
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
