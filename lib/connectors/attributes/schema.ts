import pickBy from "lodash/pickBy";
import type { z } from "zod";
import type { IconComponent } from "@/components/ui/icon";
import type { toggleValue } from "./common";

/** One face of a toggle: what it shows and says while in that state. */
type ToggleFace = { icon: IconComponent; label: string };

type AttributeEdit =
	| { kind: "enum"; value: z.ZodEnum<Record<string, string>> }
	/** A boolean stored as "true" or "false", switched between two iconed faces. */
	| {
			kind: "toggle";
			value: typeof toggleValue;
			on: ToggleFace;
			off: ToggleFace;
	  }
	| { kind: "text"; value?: undefined; placeholder?: string; rows?: number }
	/** A count of seconds typed in, at least `min`. Empty leaves it unset. */
	| { kind: "seconds"; value: z.ZodType<string>; min: number }
	/** Image URLs as tiles; `continuity` adds the previous visual's pictures and their link toggle. */
	| { kind: "images"; value?: undefined; continuity?: true }
	/** One picture to open on: the visual before, or an image URL. */
	| { kind: "frame"; value: z.ZodType<string> };

export interface AttributeDef {
	key: string;
	label: string;
	/** Unit suffix appended to the displayed value (e.g. `"s"` for seconds). */
	unit?: string;
	/** What sets it. Left out, nothing on screen does. */
	edit?: AttributeEdit;
	/** Value seeded into the element's attributes when it is created. */
	default?: string;
	/** Kept out of the settings popover, for an attribute set from elsewhere. */
	hidden?: boolean;
	/** Holds for this provider and model alone. */
	perModel?: boolean;
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

	get settingsDefs(): AttributeDef[] {
		return this.defs.filter((def) => def.edit && !def.hidden);
	}

	get baseDefs(): AttributeDef[] {
		return this.defs.filter((def) => !def.perModel);
	}

	/** Whether the element can carry this value: a key outside the schema never can. */
	offers(key: string, value: string): boolean {
		const def = this.defs.find((candidate) => candidate.key === key);
		return !!def && (def.edit?.value?.safeParse(value).success ?? true);
	}

	/** The offered attributes over the defaults: pasted OSML and saved projects can hold anything. */
	resolve(attrs: Record<string, string>): Record<string, string> {
		return {
			...this.defaultAttributes,
			...pickBy(attrs, (value, key) => this.offers(key, value)),
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
