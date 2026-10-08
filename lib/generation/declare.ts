import type { CanvasElement, GeneratedElement } from "@/lib/canvas/types";
import type { PluginContext } from "@/lib/connectors/types";
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

/** One labelled value, read back at generation as the node's inputs recorded it. */
export const read = (
	label: string,
	value: (element: CanvasElement, ctx: BuildContext) => string | undefined,
) =>
	Object.assign(
		(element: CanvasElement, ctx: BuildContext) => ({
			[label]: value(element, ctx),
		}),
		{ value: (ctx: PluginContext) => ctx.reads?.[label] },
	);

/** One labelled element, whose result arrives at generation. */
export const depend = (
	label: string,
	pick: (
		element: CanvasElement,
		ctx: BuildContext,
	) => GeneratedElement | undefined,
) =>
	Object.assign(
		(element: CanvasElement, ctx: BuildContext) => ({
			[label]: pick(element, ctx),
		}),
		{ result: (ctx: PluginContext) => ctx.dependencies?.[label] },
	);
