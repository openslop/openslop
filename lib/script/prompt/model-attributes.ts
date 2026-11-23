import uniqWith from "lodash/uniqWith";
import { dedent } from "@/lib/dedent";
import {
	attributeSchemaFor,
	type ElementModel,
} from "@/lib/canvas/element-connector";
import { optionsOf } from "@/lib/connectors/attributes/schema";
import { sameModel } from "@/lib/connectors/models";

const sameElementModel = (a: ElementModel, b: ElementModel): boolean =>
	a.type === b.type && sameModel(a.model, b.model);

const modelLines = ({ type, model }: ElementModel): string[] => {
	const defs = attributeSchemaFor(type, model).modelDefs;
	if (defs.length === 0) return [];
	const values = defs.map((def) => `${def.key}: ${optionsOf(def).join(", ")}.`);
	return [
		`- <${type} provider="${model.provider}" model="${model.model}">: ${values.join(" ")}`,
	];
};

export function modelAttributesSection(
	models: ElementModel[],
): string | undefined {
	const lines = uniqWith(models, sameElementModel).flatMap(modelLines);
	if (lines.length === 0) return undefined;
	return dedent`
		## Model attributes
		Some attributes depend on the element's model. Set only the values its own model allows:
		${lines.join("\n")}
	`;
}
