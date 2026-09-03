import { DEFAULT_MODELS } from "../models";
import type { ConnectorType } from "../types";
import type { AttributeDef } from "./schema";

/** Two attributes rather than one: a model name is only unique within its provider. */
export const modelDefs = (
	type: ConnectorType,
	{
		key = "model",
		providerAttr = "provider",
		...spec
	}: Partial<AttributeDef> & { providerAttr?: string } = {},
): AttributeDef[] => [
	{
		key: providerAttr,
		label: "Provider",
		hidden: true,
		default: DEFAULT_MODELS[type].provider,
	},
	{
		key,
		label: "Model",
		badge: true,
		edit: { kind: "model", type, providerAttr },
		default: DEFAULT_MODELS[type].model,
		...spec,
	},
];
