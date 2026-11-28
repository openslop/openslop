import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { connectorOf, ContentTypeSchema } from "@/lib/canvas/types";
import { hasModel, modelRefSchema } from "@/lib/connectors/models";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import {
	optionsOf,
	type AttributeDef,
} from "@/lib/connectors/attributes/schema";
import { disjunction } from "@/lib/format";
import { defineTool } from "./define-tool";

const allowedValues = (def: AttributeDef): string =>
	def.edit?.kind === "range"
		? `${def.edit.min} to ${def.edit.max}`
		: disjunction(optionsOf(def));

export const readModelAttributes = defineTool({
	description: dedent`
	  Read the values a model allows for the attributes that depend on it, like duration.
	  Read it before setting one of them or switching an element's model.
	`,
	input: modelRefSchema
		.extend({ type: ContentTypeSchema })
		.refine(({ type, ...model }) => hasModel(connectorOf(type), model), {
			error: "Not a model of that type. Pick a pair from list_models.",
		}),
	output: z.string(),
	icon: Eye,
	label: ({ model }) => `Reading ${model ?? "model"} options`,
	execute: async ({ type, ...model }) => {
		const defs = attributeSchemaFor(type, model).modelDefs;
		if (defs.length === 0) return "This model has no attributes of its own.";
		const values = defs.map((def) => `${def.key} ${allowedValues(def)}`);
		return `- <${type}> with model="${model.model}": ${values.join(", ")}.`;
	},
});
