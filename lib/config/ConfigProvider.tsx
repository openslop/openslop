"use client";

import { useMemo, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	withRegistry,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import { createVoiceHydratePlugin } from "../connectors/tts/plugins/voice-hydrate";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";

type ConfigContextValue = {
	projectId: string;
	connectorConfig: ConnectorRegistry;
};

const [ConfigContext, useConfig] =
	createRequiredContext<ConfigContextValue>("ConfigProvider");
export { useConfig };

export function ConfigProvider({
	projectId,
	children,
}: {
	projectId: string;
	children: ReactNode;
}) {
	const store = useProjectStoreHandle();

	const configWithPlugins = useMemo<ConnectorRegistry>(() => {
		return withRegistry(DEFAULT_CONNECTOR_REGISTRY)
			.appendPlugins("tts", createVoiceHydratePlugin(store))
			.build();
	}, [store]);

	const value = useMemo<ConfigContextValue>(
		() => ({ projectId, connectorConfig: configWithPlugins }),
		[projectId, configWithPlugins],
	);

	return <ConfigContext value={value}>{children}</ConfigContext>;
}
