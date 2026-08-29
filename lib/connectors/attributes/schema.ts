import type { IconComponent } from "@/components/ui/icon";

export type AttributeEdit =
	| { kind: "enum"; options: readonly string[] }
	| { kind: "text"; placeholder?: string; rows?: number }
	/** A list of image URLs, edited as tiles. */
	| { kind: "images" };

export interface AttributeSpec {
	label: string;
	/** When set, the badge shows this icon in place of the text label. */
	icon?: IconComponent;
	/** Unit suffix appended to the displayed value (e.g. `"s"` for seconds). */
	unit?: string;
	edit?: AttributeEdit;
}

export interface AttributeDef extends AttributeSpec {
	key: string;
	/** Value seeded into `customAttributes` when the element is created. */
	default?: string;
	/** Rendered on the element header rather than inside the settings popover. */
	badge?: boolean;
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

	/** The attributes shown on the element header, in def order. */
	get badgeAttributes(): Record<string, AttributeSpec> {
		return this.specs(true);
	}

	/** The attributes shown in the settings popover, in def order. */
	get settingsAttributes(): Record<string, AttributeSpec> {
		return this.specs(false);
	}

	private specs(badge: boolean): Record<string, AttributeSpec> {
		const out: Record<string, AttributeSpec> = {};
		for (const def of this.defs) {
			if ((def.badge ?? false) !== badge) continue;
			out[def.key] = {
				label: def.label,
				icon: def.icon,
				unit: def.unit,
				edit: def.edit,
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
