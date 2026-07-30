"use client";

import { useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/** A builder bound to this project, rebuilt when the state it reads changes. */
export function useNodeBuilder(): NodeBuilder {
	const { connectorConfig } = useConfig();
	const metadata = useProject((s) => s.metadata);
	const referenceImages = useProject((s) => s.referenceImages);
	return useMemo(
		() => nodeBuilder(connectorConfig, { metadata, referenceImages }),
		[connectorConfig, metadata, referenceImages],
	);
}
