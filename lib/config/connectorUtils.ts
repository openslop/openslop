import set from "lodash/fp/set";
import type {
	ConnectorConfig,
	ConnectorPlugin,
	ConnectorType,
	ProviderKey,
} from "@/lib/connectors/types";
import type { ConnectorRegistry } from "./ConfigProvider";

export function getDefaultConnector(
	registry: ConnectorRegistry,
	type: ConnectorType,
): { provider: ProviderKey; config: ConnectorConfig } {
	const providers = registry[type];
	for (const [provider, config] of Object.entries(providers)) {
		if (config.isDefault) {
			return { provider: provider as ProviderKey, config };
		}
	}
	const first = Object.entries(providers)[0];
	if (!first)
		throw new Error(`No providers configured for connector type "${type}"`);
	const [provider, config] = first;
	return { provider: provider as ProviderKey, config };
}

export function withRegistry(registry: ConnectorRegistry) {
	const apply = (cfg: ConnectorRegistry) => ({
		appendPlugins: (type: ConnectorType, ...plugins: ConnectorPlugin[]) => {
			const { provider, config } = getDefaultConnector(cfg, type);
			const next = set(
				[type, provider, "plugins"],
				[...(config.plugins ?? []), ...plugins],
				cfg,
			);
			return apply(next);
		},
		build: () => cfg,
	});
	return apply(registry);
}
