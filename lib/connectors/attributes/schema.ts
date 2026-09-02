import type { IconComponent } from "@/components/ui/icon";
import type { ConnectorType } from "../types";

export type AttributeEdit =
	| { kind: "enum"; options: readonly string[] }
	/**
	 * The model a generation runs on, picked through a control that can also
	 * say what each model costs and which of them the account can reach. One
	 * pick writes two attributes: this one and the provider it names.
	 */
	| { kind: "model"; connector: ConnectorType; providerAttr: string }
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
	/** Carried on the element but shown nowhere: another attribute's control sets it. */
	hidden?: boolean;
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
		return this.specsWhere((def) => def.badge === true);
	}

	/** The attributes shown in the settings popover, in def order. */
	get settingsAttributes(): Record<string, AttributeSpec> {
		return this.specsWhere((def) => def.badge !== true && def.hidden !== true);
	}

	private specsWhere(
		include: (def: AttributeDef) => boolean,
	): Record<string, AttributeSpec> {
		return Object.fromEntries(
			this.defs
				.filter(include)
				.map(({ key, label, icon, unit, edit }): [string, AttributeSpec] => [
					key,
					{ label, icon, unit, edit },
				]),
		);
	}

	/** Whether the schema would let the settings popover produce this value. */
	private offers(key: string, value: string): boolean {
		const edit = this.defs.find((def) => def.key === key)?.edit;
		return edit && "options" in edit ? edit.options.includes(value) : true;
	}

	/**
	 * The attributes an element carries: the caller's, with defaults standing in
	 * wherever they name an option the schema doesn't offer (pasted OSML, a
	 * saved project from an older catalog).
	 */
	resolve(attrs: Record<string, string>): Record<string, string> {
		return {
			...this.defaultAttributes,
			...Object.fromEntries(
				Object.entries(attrs).filter(([key, value]) => this.offers(key, value)),
			),
		};
	}

	get defaultAttributes(): Record<string, string> {
		const out: Record<string, string> = {};
		for (const def of this.defs) {
			if (def.default !== undefined) out[def.key] = def.default;
		}
		return out;
	}
}
