import { DEFAULT_MODELS } from "../models";
import type { ConnectorType, ModelRef } from "../types";
import type { AttributeDef } from "./schema";

/** The attributes every element carries as its own model, whatever its type. */
export const ELEMENT_MODEL = {
	key: "model",
	providerAttr: "provider",
} as const satisfies { key: keyof ModelRef; providerAttr: keyof ModelRef };

/**
 * A further model an element carries beside its own. Two attributes rather
 * than one: a model name is only unique within its provider.
 */
export const modelDefs = (
	type: ConnectorType,
	{
		key,
		providerAttr,
		...spec
	}: Partial<AttributeDef> & { key: string; providerAttr: string },
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
