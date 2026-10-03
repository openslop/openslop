import type { ScriptElement } from "@/lib/canvas/types";
import type { AssetResult } from "@/lib/connectors/types";
import type { BuildContext } from "./graph";

/** Keyed as the handles declared them. */
export type DependencyResults = Record<string, AssetResult>;

type Readable = { dependencies?: DependencyResults };

type Edge = readonly [key: string, target: ScriptElement, label: string];

/** The elements a plugin makes an element read, keyed as their results return, labelled for the user. */
export interface DependencyDeclaration {
	edges(element: ScriptElement, ctx: BuildContext): readonly Edge[];
}

/** One element, declared once and read back through the same handle. */
export interface DependencyHandle extends DependencyDeclaration {
	read(ctx: Readable): AssetResult | undefined;
}

/** Picking nothing declares no dependency. */
export function dependency(
	key: string,
	label: string,
	pick: (
		element: ScriptElement,
		ctx: BuildContext,
	) => ScriptElement | undefined,
): DependencyHandle {
	return {
		edges: (element, ctx) => {
			const target = pick(element, ctx);
			if (!target) return [];
			return [[key, target, label]];
		},
		read: (ctx) => ctx.dependencies?.[key],
	};
}

/** One dependency per name an element lists, each read back by that name. */
export function dependencyPerName(
	names: (element: ScriptElement) => string[],
	one: (name: string) => DependencyHandle,
) {
	return {
		edges: (element: ScriptElement, ctx: BuildContext) =>
			names(element).flatMap((name) => one(name).edges(element, ctx)),
		read: (name: string, ctx: Readable) => one(name).read(ctx),
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
