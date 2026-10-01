import type { CanvasContentElement } from "@/lib/canvas/types";
import type { AssetResult } from "@/lib/connectors/types";
import type { NodeSpec } from "./graph";

/** Keyed as the handles declared them. */
export type DependencyResults = Record<string, AssetResult>;

type Readable = { dependencies?: DependencyResults };

/**
 * The dependencies a plugin adds to an element's node, keyed as their results
 * come back, each with how the element names it to the user.
 */
export interface DependencyDeclaration {
	specs(
		element: CanvasContentElement,
	): readonly (readonly [key: string, spec: NodeSpec, label: string])[];
}

/** One node, declared once and read back through the same handle. */
export interface DependencyHandle extends DependencyDeclaration {
	read(ctx: Readable): AssetResult | undefined;
}

/** A null spec declares no dependency. */
export function dependency(
	key: string,
	label: string | ((element: CanvasContentElement) => string),
	spec: (element: CanvasContentElement) => NodeSpec | null,
): DependencyHandle {
	return {
		specs: (element) => {
			const nodeSpec = spec(element);
			if (!nodeSpec) return [];
			return [
				[key, nodeSpec, typeof label === "string" ? label : label(element)],
			];
		},
		read: (ctx) => ctx.dependencies?.[key],
	};
}
