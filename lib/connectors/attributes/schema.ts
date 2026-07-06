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

function mergeDefs(
	base: readonly AttributeDef[],
	added: readonly AttributeDef[],
): AttributeDef[] {
	const byKey = new Map(base.map((def) => [def.key, def]));
	for (const def of added) byKey.set(def.key, def);
	return [...byKey.values()];
}

/** An ordered, immutable set of attribute definitions for a connector type/model. */
export class AttributeSchema {
	private constructor(private readonly defs: readonly AttributeDef[]) {}

	static from(defs: readonly AttributeDef[]): AttributeSchema {
		return new AttributeSchema(defs);
	}

	/** Layer `overrides` on top of `base` (same-key defs in overrides win, new keys append). */
	static merge(
		base: AttributeSchema,
		overrides: AttributeSchema,
	): AttributeSchema {
		return overrides.extend(base);
	}

	/** Layer this schema's defs on top of `base`'s (same-key defs override, new keys append). */
	extend(base: AttributeSchema): AttributeSchema {
		return AttributeSchema.from(mergeDefs(base.defs, this.defs));
	}

	add(def: AttributeDef): AttributeSchema {
		return AttributeSchema.from(mergeDefs(this.defs, [def]));
	}

	override(
		key: string,
		partial: Partial<Omit<AttributeDef, "key">>,
	): AttributeSchema {
		return AttributeSchema.from(
			this.defs.map((def) => (def.key === key ? { ...def, ...partial } : def)),
		);
	}

	remove(key: string): AttributeSchema {
		return AttributeSchema.from(this.defs.filter((def) => def.key !== key));
	}

	build(): AttributeSchema {
		return this;
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
