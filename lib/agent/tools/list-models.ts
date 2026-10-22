import compact from "lodash/compact";
import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { InsertElement } from "@/components/ui/icon";
import { MODEL_GROUPS, type ModelGroup } from "@/lib/connectors/model-groups";
import { listModels as catalogModels } from "@/lib/connectors/models";
import type { ModelEntry, ModelRef } from "@/lib/connectors/types";
import type { AgentToolContext } from "./context";
import { defineTool } from "./define-tool";

const modelLine = ({ provider, model, description }: ModelRef & ModelEntry) =>
	`- ${compact([`${model} from ${provider}`, description]).join(". ")}`;

const groupSection = (
	{ label, types: [type] }: ModelGroup,
	isConnected: AgentToolContext["isConnected"],
) =>
	[
		`${label} (type ${type})`,
		...catalogModels(type)
			.filter(({ provider }) => isConnected(provider))
			.map(modelLine),
	].join("\n");

export const listModels = defineTool({
	description: dedent`
	  List the models the user can generate with, for each kind of element, and what each is
	  best at. Pick models only from these.
	`,
	input: z.object({}),
	output: z.string(),
	icon: InsertElement,
	label: "Reading the models",
	execute: async (_, ctx) =>
		MODEL_GROUPS.map((group) => groupSection(group, ctx.isConnected)).join(
			"\n\n",
		),
});
