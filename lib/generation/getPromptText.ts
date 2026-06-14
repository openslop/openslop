import { Node } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";

export function getPromptText(element: CanvasContentElement): string {
	return Node.string(element).replaceAll(ZERO_WIDTH_SPACE, "").trim();
}
