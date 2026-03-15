"use client";

import { Plus } from "lucide-react";
import { Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import { ELEMENT_LIST } from "../config/elementConfigs";
import type { CanvasElement, CanvasElementType } from "../types";
import { createElementNode } from "../utils/nodeUtils";

export function AddElementDivider({ element }: { element: CanvasElement }) {
  const editor = useSlateStatic();

  function handleAdd(type: CanvasElementType) {
    const path = ReactEditor.findPath(editor, element);
    Transforms.insertNodes(editor, createElementNode(type), {
      at: [path[0] + 1],
    });
  }

  return (
    <div
      contentEditable={false}
      className="group/divider relative z-20 -mt-1.5 h-2 select-none"
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10 opacity-0 transition-opacity group-hover/divider:opacity-100" />
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center gap-1.5 opacity-0 transition-opacity group-hover/divider:opacity-100">
        {ELEMENT_LIST.map((config) => (
          <button
            key={config.id}
            type="button"
            aria-label={`Add ${config.label}`}
            onClick={() => handleAdd(config.type)}
            className={`grain ${config.bgColor} relative overflow-hidden flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] text-white/90 shadow-sm shadow-black/20 transition-colors hover:brightness-125 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none`}
          >
            <Plus size={10} strokeWidth={1.5} />
            {config.label}
          </button>
        ))}
      </div>
    </div>
  );
}
