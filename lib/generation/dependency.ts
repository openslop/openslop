import type { ScriptElement } from "@/lib/canvas/types";
import type { AssetResult } from "@/lib/connectors/types";
import type { BuildContext } from "./graph";

/** Keyed by the label each dependency was declared under. */
export type DependencyResults = Record<string, AssetResult>;

/** An element generated first and handed over under `label`; picking nothing declares no dependency. */
export function dependency(
	label: string,
	pick: (
		element: ScriptElement,
		ctx: BuildContext,
	) => ScriptElement | undefined,
) {
	return {
		dependencies: (
			element: ScriptElement,
			ctx: BuildContext,
		): Record<string, ScriptElement> => {
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
	read: (element: ScriptElement, ctx: BuildContext) => string | undefined,
) {
	return {
		reads: (element: ScriptElement, ctx: BuildContext) => {
			const value = read(element, ctx);
			return value === undefined ? {} : { [label]: value };
		},
		value: (ctx: { reads?: Record<string, string> }) => ctx.reads?.[label],
	};
}
