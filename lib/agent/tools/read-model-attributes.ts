import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { connectorOf, ContentTypeSchema } from "@/lib/canvas/types";
import { hasModel, modelRefSchema } from "@/lib/connectors/models";
import { modelLine } from "@/lib/script/prompt/model-attributes";
import { defineTool } from "./define-tool";

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
	label: ({ model }) => `Reading what ${model ?? "the model"} allows`,
	execute: async ({ type, ...model }) =>
		modelLine({ type, model }) ??
		`<${type}> with model="${model.model}" has no attributes of its own.`,
});
