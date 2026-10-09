import type { CanvasElement, GeneratedElement } from "@/lib/canvas/types";
import type { BuildContext } from "./graph";

/** Values a plugin records off the canvas or the settings, by label; a change to one stales the result. */
export type Read = (
	element: CanvasElement,
	ctx: BuildContext,
) => Record<string, string | undefined>;

/** Elements generated first and handed over, by label. */
export type Dependency = (
	element: CanvasElement,
	ctx: BuildContext,
) => Record<string, GeneratedElement | undefined>;
