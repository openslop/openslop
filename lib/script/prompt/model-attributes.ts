import compact from "lodash/compact";
import uniqWith from "lodash/uniqWith";
import { dedent } from "@/lib/dedent";
import {
	attributeSchemaFor,
	type ElementModel,
} from "@/lib/canvas/element-connector";
import {
	optionsOf,
	type AttributeDef,
} from "@/lib/connectors/attributes/schema";
import { sameModel } from "@/lib/connectors/models";
import { disjunction } from "@/lib/format";

const sameElementModel = (a: ElementModel, b: ElementModel): boolean =>
	a.type === b.type && sameModel(a.model, b.model);

const allowedValues = (def: AttributeDef): string =>
	def.edit?.kind === "range"
		? `${def.edit.min} to ${def.edit.max}`
		: disjunction(optionsOf(def));

export function modelLine({ type, model }: ElementModel): string | undefined {
	const defs = attributeSchemaFor(type, model).modelDefs;
	if (defs.length === 0) return undefined;
	const values = defs.map((def) => `${def.key} ${allowedValues(def)}`);
	return `- <${type}> with model="${model.model}": ${values.join(", ")}.`;
}

export function modelAttributesSection(
	models: ElementModel[],
): string | undefined {
	const lines = compact(uniqWith(models, sameElementModel).map(modelLine));
	if (lines.length === 0) return undefined;
	return dedent`
		## Model attributes
		Some attributes depend on an element's model, set by its model attribute. Use only the values its model allows:
		${lines.join("\n")}
	`;
}
