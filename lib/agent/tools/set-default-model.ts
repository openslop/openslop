import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { InsertElement } from "@/components/ui/icon";
import { groupFor, groupModels } from "@/lib/connectors/model-groups";
import { modelEntry, modelRefSchema } from "@/lib/connectors/models";
import { CONNECTOR_TYPES } from "@/lib/connectors/types";
import { defineTool } from "./define-tool";
import { requireConnected } from "./require-connected";

export const setDefaultModel = defineTool({
	description: dedent`
	  Set the model new elements of a type get. Elements already on the canvas keep theirs;
	  change those with edit_script.
	`,
	input: modelRefSchema.extend({ type: z.enum(CONNECTOR_TYPES) }),
	output: z.string(),
	icon: InsertElement,
	label: ({ model }) =>
		`Setting the default model${model ? ` to ${model}` : ""}`,
	execute: async ({ type, ...model }, ctx) => {
		modelEntry(type, model);
		requireConnected(model.provider, ctx);
		const { label, types } = groupFor(type);
		ctx.updateModels(groupModels(types, model));
		return `New ${label.toLowerCase()} elements now get ${model.model} from ${model.provider}.`;
	},
});
