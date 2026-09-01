import { CONNECTOR_GROUPS } from "./connectorConfigs";
import type { ConnectorType } from "./types";

/**
 * How the connector browser filters what a provider can do. The same grouping
 * people pick models with, plus the one that matches everything.
 */
export type Capability = {
	key: string;
	label: string;
	/** Null for the filter that matches everything. */
	types: ConnectorType[] | null;
};

export const CAPABILITIES: Capability[] = [
	{ key: "all", label: "All", types: null },
	...CONNECTOR_GROUPS.map(({ key, label, types }) => ({ key, label, types })),
];

export const matchesCapability = (
	modalities: ConnectorType[],
	capability: Capability,
): boolean =>
	capability.types === null ||
	capability.types.some((type) => modalities.includes(type));
