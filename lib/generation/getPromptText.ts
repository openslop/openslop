import { Node } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";

const ZERO_WIDTH_SPACE = "​";

export function getPromptText(element: CanvasContentElement): string {
	return Node.string(element).replaceAll(ZERO_WIDTH_SPACE, "").trim();
}
