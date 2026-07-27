import type { IconComponent } from "@/components/ui/icon";

export type AttributeEdit =
	| { kind: "enum"; options: readonly string[] }
	| { kind: "text"; placeholder?: string; rows?: number };

export interface AttributeSpec {
	label: string;
	/** When set, the badge shows this icon in place of the text label. */
	icon?: IconComponent;
	/** Unit suffix appended to the displayed value (e.g. `"s"` for seconds). */
	unit?: string;
	edit?: AttributeEdit;
	/** Value seeded at creation and shown by the editor whenever the key is absent. */
	default?: string;
}

export interface AttributeDef extends AttributeSpec {
	key: string;
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
			out[def.key] = {
				label: def.label,
				icon: def.icon,
				unit: def.unit,
				edit: def.edit,
				default: def.default,
			};
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
