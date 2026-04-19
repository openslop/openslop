import { Node } from "slate";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import type { CanvasContentElement } from "../types";

export function getPromptText(element: CanvasContentElement): string {
  return Node.string(element).replaceAll(ZERO_WIDTH_SPACE, "").trim();
}
