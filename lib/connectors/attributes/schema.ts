import type { LucideIcon } from "@/components/ui/icon";

export type AttributeEdit =
	| { kind: "enum"; options: readonly string[] }
	| { kind: "text"; placeholder?: string; rows?: number };

export interface AttributeSpec {
	label: string;
	/** When set, the badge shows this icon in place of the text label. */
	icon?: LucideIcon;
	edit?: AttributeEdit;
}

export interface AttributeDef extends AttributeSpec {
	key: string;
	default?: string;
}

/** An ordered, immutable set of attribute definitions for a connector type/model. */
export class AttributeSchema {
	private constructor(private readonly defs: readonly AttributeDef[]) {}

	static from(defs: readonly AttributeDef[]): AttributeSchema {
		return new AttributeSchema(defs);
	}

	get keys(): string[] {
		return this.defs.map((def) => def.key);
	}

	/** Shape consumed by `AttributeBadge`/`ElementSettings`. */
	get visibleAttributes(): Record<string, AttributeSpec> {
		const out: Record<string, AttributeSpec> = {};
		for (const def of this.defs) {
			out[def.key] = { label: def.label, icon: def.icon, edit: def.edit };
		}
		return out;
	}

	get defaultAttributes(): Record<string, string> {
		const out: Record<string, string> = {};
		for (const def of this.defs) {
			if (def.default !== undefined) out[def.key] = def.default;
		}
		return out;
	}
}
