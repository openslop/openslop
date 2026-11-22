import { dedent } from "@/lib/dedent";
import type { ModelAttributes } from "@/lib/canvas/element-connector";
import { optionsOf } from "@/lib/connectors/attributes/schema";

const modelLine = ({ type, model, defs }: ModelAttributes): string =>
	`- <${type} provider="${model.provider}" model="${model.model}">: ${defs
		.map((def) => `${def.key}: ${optionsOf(def).join(", ")}.`)
		.join(" ")}`;

export const modelAttributesSection = (
	models: ModelAttributes[],
): string | undefined =>
	models.length > 0
		? dedent`
				## Model attributes
				Some attributes depend on the element's model. Set only the values its own model allows:
				${models.map(modelLine).join("\n")}
			`
		: undefined;
