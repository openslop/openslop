import type { CanvasContentElement } from "@/lib/canvas/types";
import type { AssetResult } from "@/lib/connectors/types";
import type { NodeSpec } from "./graph";

/** Keyed as the handles declared them. */
export type DependencyResults = Record<string, AssetResult>;

type Readable = { dependencies?: DependencyResults };

/** The edges a plugin adds to an element's node, keyed as their results come back. */
export interface DependencyDeclaration {
	specs(
		element: CanvasContentElement,
	): readonly (readonly [string, NodeSpec])[];
}

/** One node, declared once and read back through the same handle. */
export interface Dependency extends DependencyDeclaration {
	read(ctx: Readable): AssetResult | undefined;
}

/** A null spec declares no edge. */
export function dependency(
	key: string,
	spec: (element: CanvasContentElement) => NodeSpec | null,
): Dependency {
	return {
		specs: (element) => {
			const named = spec(element);
			return named ? [[key, named]] : [];
		},
		read: (ctx) => ctx.dependencies?.[key],
	};
}
