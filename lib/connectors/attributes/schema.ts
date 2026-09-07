import type { IconComponent } from "@/components/ui/icon";
import { resolveModel, type ConnectorModels } from "../models";
import type { ConnectorType } from "../types";

export const TOGGLE_VALUES: readonly string[] = ["false", "true"];

/** One face of a toggle: what it shows and says while in that state. */
export type ToggleFace = { icon: IconComponent; label: string };

export type AttributeEdit =
	| { kind: "enum"; options: readonly string[] }
	/** A boolean stored as "true" or "false", switched between two iconed faces. */
	| { kind: "toggle"; on: ToggleFace; off: ToggleFace }
	/**
	 * The model a generation runs on, picked through a control that can also
	 * say what each model costs and which of them the account can reach. One
	 * pick writes two attributes: this one and the provider it names.
	 */
	| { kind: "model"; type: ConnectorType; providerAttr: string }
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

export type ModelPick = { key: string } & Extract<
	AttributeEdit,
	{ kind: "model" }
>;

type SchemaOptions = {
	/** Keeps the element's own model control off the header, for a type whose model is picked elsewhere. */
	hideModel?: boolean;
};

/** An ordered, immutable set of attribute definitions for a connector type/model. */
export class AttributeSchema {
	private constructor(
		private readonly defs: readonly AttributeDef[],
		private readonly options: SchemaOptions,
	) {}

	static from(
		defs: readonly AttributeDef[],
		options: SchemaOptions = {},
	): AttributeSchema {
		return new AttributeSchema(defs, options);
	}

	get hidesModel(): boolean {
		return this.options.hideModel === true;
	}

	get keys(): string[] {
		return this.defs.map((def) => def.key);
	}

	/** The models the element carries beside its own, each naming the connector it resolves from. */
	private get modelPicks(): ModelPick[] {
		return this.defs.flatMap(({ key, edit }) =>
			edit?.kind === "model" ? [{ key, ...edit }] : [],
		);
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
	offers(key: string, value: string): boolean {
		const edit = this.defs.find((def) => def.key === key)?.edit;
		if (edit?.kind === "enum") return edit.options.includes(value);
		if (edit?.kind === "toggle") return TOGGLE_VALUES.includes(value);
		return true;
	}

	/**
	 * The attributes an element carries: the caller's, with defaults standing in
	 * wherever they name an option the schema doesn't offer (pasted OSML, a
	 * saved project from an older catalog). A model the schema carries resolves
	 * like the element's own: the caller's pair, else the scoped default, else
	 * the recommendation.
	 */
	resolve(
		attrs: Record<string, string>,
		defaultModels: ConnectorModels = {},
	): Record<string, string> {
		const models = Object.fromEntries(
			this.modelPicks.flatMap(({ key, providerAttr, type }) => {
				const pick = resolveModel(
					type,
					{ provider: attrs[providerAttr], model: attrs[key] },
					defaultModels[type],
				);
				return [
					[providerAttr, pick.provider],
					[key, pick.model],
				];
			}),
		);
		return {
			...this.defaultAttributes,
			...Object.fromEntries(
				Object.entries(attrs).filter(([key, value]) => this.offers(key, value)),
			),
			...models,
		};
	}

	get defaultAttributes(): Record<string, string> {
		return Object.fromEntries(
			this.defs.flatMap((def) =>
				def.default === undefined ? [] : [[def.key, def.default]],
			),
		);
	}
}
