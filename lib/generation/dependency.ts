import type { GeneratedElement, CanvasElement } from "@/lib/canvas/types";
import type { AssetResult } from "@/lib/connectors/types";
import type { BuildContext } from "./graph";

export type DependencyResults = Record<string, AssetResult>;

/** An element generated first and handed over under `label`; picking nothing declares no dependency. */
export function dependency(
	label: string,
	pick: (
		element: CanvasElement,
		ctx: BuildContext,
	) => GeneratedElement | undefined,
) {
	return {
		dependencies: (
			element: CanvasElement,
			ctx: BuildContext,
		): Record<string, GeneratedElement> => {
			const target = pick(element, ctx);
			return target ? { [label]: target } : {};
		},
		result: (ctx: { dependencies?: DependencyResults }) =>
			ctx.dependencies?.[label],
	};
}

/** A value read off the canvas or the settings, recorded under `label` and read back at generation. */
export function reading(
	label: string,
	read: (element: CanvasElement, ctx: BuildContext) => string | undefined,
) {
	return {
		reads: (element: CanvasElement, ctx: BuildContext) => {
			const value = read(element, ctx);
			return value === undefined ? {} : { [label]: value };
		},
		value: (ctx: { reads?: Record<string, string> }) => ctx.reads?.[label],
	};
}
