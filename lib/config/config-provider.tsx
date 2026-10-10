"use client";

import { useMemo, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/create-required-context";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";

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
	const value = useMemo<ConfigContextValue>(
		() => ({ projectId, connectorConfig: DEFAULT_CONNECTOR_REGISTRY }),
		[projectId],
	);

	return <ConfigContext value={value}>{children}</ConfigContext>;
}
