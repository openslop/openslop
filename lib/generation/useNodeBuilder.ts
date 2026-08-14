"use client";

import { useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/**
 * Builds against the project state as it is when called, so holding a builder
 * costs nothing: a store write re-derives what reads a node, not everyone who
 * can build one.
 */
export function useNodeBuilder(): NodeBuilder {
	const { connectorConfig } = useConfig();
	const store = useProjectStoreHandle();
	return useMemo<NodeBuilder>(
		() => (spec) => nodeBuilder(connectorConfig, store.getState())(spec),
		[connectorConfig, store],
	);
}
