import compact from "lodash/compact";
import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { InsertElement } from "@/components/ui/icon";
import { MODEL_GROUPS, type ModelGroup } from "@/lib/connectors/model-groups";
import {
	defaultModelFor,
	listModels as catalogModels,
	modelSourceFor,
	type ModelDefaults,
} from "@/lib/connectors/models";
import type { ModelEntry, ModelRef } from "@/lib/connectors/types";
import { defineTool } from "./define-tool";

const modelLine = ({
	provider,
	model,
	cost,
	speed,
	description,
}: ModelRef & ModelEntry) =>
	`- ${compact([`${model} from ${provider}`, `cost ${cost}, speed ${speed}`, description]).join(". ")}`;

const groupSection = (
	{ label, types: [type] }: ModelGroup,
	chain: ModelDefaults,
) => {
	const fallback = defaultModelFor(type, chain);
	return [
		`${label} (type ${type}). New elements get ${fallback.model} from ${fallback.provider}, the ${modelSourceFor(type, fallback, chain)} default.`,
		...catalogModels(type).map(modelLine),
	].join("\n");
};

export const listModels = defineTool({
	description: dedent`
	  List the models for each kind of element: cost, speed, what each is best at, and which
	  one new elements get.
	`,
	input: z.object({}),
	output: z.string(),
	icon: InsertElement,
	label: "Reading the models",
	execute: async (_, ctx) => {
		const chain = ctx.modelChain();
		return MODEL_GROUPS.map((group) => groupSection(group, chain)).join("\n\n");
	},
});
