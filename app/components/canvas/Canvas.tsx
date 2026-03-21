"use client";

import { useCallback, useMemo, KeyboardEvent } from "react";
import { Slate, Editable, RenderElementProps } from "slate-react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEditorSetup } from "./hooks/useEditorSetup";
import { useScriptSync } from "./hooks/useScriptSync";
import { useGenerateAll } from "./hooks/useGenerateAll";
import { useDragAndDrop } from "./dnd/useDragAndDrop";
import { SortableElement } from "./dnd/SortableElement";
import { DragOverlayContent } from "./dnd/DragOverlay";
import { PanelItem } from "./panel/PanelItem";
import Sidebar from "./panel/Sidebar";
import { renderCanvasElement } from "./elements/ElementContainer";
import { SparklesIcon } from "./elements/OutputPreview";
import { ELEMENT_CONFIGS } from "./config/elementConfigs";
export default function Canvas() {
  const { editor, value, setValue } = useEditorSetup();
  const {
    activeId,
    items,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleDragOver,
  } = useDragAndDrop(editor, value);

  useScriptSync(editor);
  const { generateAll } = useGenerateAll();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        editor.insertText("\n");
      }
    },
    [editor],
  );

  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <SortableElement {...props} renderElement={renderCanvasElement} />
    ),
    [],
  );

  const activeEditorElement = useMemo(
    () => editor.children.find((x) => x.id === activeId),
    [editor.children, activeId],
  );

  const activePanelItem = useMemo(
    () => ELEMENT_CONFIGS[activeId as keyof typeof ELEMENT_CONFIGS],
    [activeId],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
    >
      <Sidebar />

      <Slate editor={editor} initialValue={value} onChange={setValue}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Editable
            placeholder="Start typing your story…"
            renderElement={renderElement}
            onKeyDown={handleKeyDown}
            className="font-body text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </SortableContext>
        <div className="flex justify-end mt-4" contentEditable={false}>
          <button
            type="button"
            onClick={generateAll}
            className="gen-btn opacity-80 hover:opacity-100 transition-opacity"
          >
            <SparklesIcon />
            <span>Generate All</span>
          </button>
        </div>
        <DragOverlay>
          {activeEditorElement && (
            <DragOverlayContent element={activeEditorElement} />
          )}
          {activePanelItem && <PanelItem item={activePanelItem} />}
        </DragOverlay>
      </Slate>
    </DndContext>
  );
}
