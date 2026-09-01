import { MODEL_CATALOGS } from "../models";
import type { ConnectorType } from "../types";
import type { AttributeDef } from "./schema";

/**
 * The model a generation runs on. An ordinary enum attribute, so an element type
 * that runs two generations declares two of them — naming the connector type
 * each one picks from, which is also what its provider is resolved from.
 */
export const modelDef = (
	type: ConnectorType,
	overrides: Partial<AttributeDef> = {},
): AttributeDef => {
	const catalog = MODEL_CATALOGS[type];
	return {
		key: "model",
		label: "Model",
		badge: true,
		edit: { kind: "model", connector: type, options: catalog.names },
		default: catalog.defaultModel,
		...overrides,
	};
};
