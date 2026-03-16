import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { CanvasElementType } from "../types";
import { insertElement } from "../utils/insertElement";

export function useInsertElement() {
  const editor = useSlateStatic();
  const { connectorDefaults } = useConfig();

  return useCallback(
    (type: CanvasElementType, atIndex: number) => {
      insertElement(editor, type, atIndex, connectorDefaults);
    },
    [editor, connectorDefaults],
  );
}
