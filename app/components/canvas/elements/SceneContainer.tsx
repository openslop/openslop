import { useMemo } from "react";
import { RenderElementProps } from "slate-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SceneElement } from "../types";
import { useDragTransfer } from "../dnd/DragTransferContext";

export function SceneContainer({
  attributes,
  element,
  children,
}: Pick<RenderElementProps, "attributes" | "children"> & {
  element: SceneElement;
}) {
  const childIds = useMemo(
    () => element.children.map((c) => c.id),
    [element.children],
  );

  const transfer = useDragTransfer();
  const isDropTarget =
    transfer &&
    element.id === transfer.toSceneId &&
    element.id !== transfer.fromSceneId;
  const appendToEnd = isDropTarget && transfer.atIndex >= childIds.length;

  return (
    <div
      {...attributes}
      style={{
        paddingBottom: appendToEnd ? "3rem" : undefined,
        transition: "padding-bottom 200ms ease",
      }}
    >
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}
