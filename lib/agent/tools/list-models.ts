import compact from "lodash/compact";
import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { InsertElement } from "@/components/ui/icon";
import { MODEL_GROUPS, type ModelGroup } from "@/lib/connectors/model-groups";
import {
	listModels as catalogModels,
	defaultModelFor,
	defaultSourceFor,
	type DefaultSource,
	type ModelDefaults,
} from "@/lib/connectors/models";
import type {
	ConnectorType,
	ModelEntry,
	ModelRef,
} from "@/lib/connectors/types";
import type { AgentToolContext } from "./context";
import { defineTool } from "./define-tool";

const MODELS_PER_TYPE = 5;

const SET_BY: Record<DefaultSource, string> = {
	project: "set on this project",
	account: "set on the user's account",
	recommended: "OpenSlop's recommendation",
};

const modelName = ({ provider, model }: ModelRef) =>
	`${model} from ${provider}`;

const modelLine = (entry: ModelRef & ModelEntry) =>
	`- ${compact([modelName(entry), entry.description]).join(". ")}`;

const defaultLine = (type: ConnectorType, defaults: ModelDefaults) =>
	`Default: ${modelName(defaultModelFor(type, defaults))}, ${SET_BY[defaultSourceFor(type, defaults)]}`;

const groupSection = (
	{ label, types: [type] }: ModelGroup,
	isConnected: AgentToolContext["isConnected"],
	defaults: ModelDefaults,
) =>
	[
		`${label} (type ${type})`,
		defaultLine(type, defaults),
		...catalogModels(type)
			.filter(({ provider }) => isConnected(provider))
			.slice(0, MODELS_PER_TYPE)
			.map(modelLine),
	].join("\n");

export const listModels = defineTool({
	description: dedent`
	  List the models the user can generate with for each kind of element, what each is best
	  at, and the current default and who set it. Only pick models from this list.
	`,
	input: z.object({}),
	output: z.string(),
	icon: InsertElement,
	label: "Reading the models",
	execute: async (_, ctx) => {
		const defaults = ctx.modelDefaults();
		return MODEL_GROUPS.map((group) =>
			groupSection(group, ctx.isConnected, defaults),
		).join("\n\n");
	},
});
