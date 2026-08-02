"use client";

import { useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/** Rebuilt on any store write, so reading something new costs only a source node. */
export function useNodeBuilder(): NodeBuilder {
	const { connectorConfig } = useConfig();
	const state = useProject((store) => store);
	return useMemo(
		() => nodeBuilder(connectorConfig, state),
		[connectorConfig, state],
	);
}
