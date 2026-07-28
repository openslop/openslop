"use client";

import { useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import type { GraphResolveContext } from "./graph";

/** The context `resolveGraph` needs, rebuilt when the state it reads changes. */
export function useGraphContext(): GraphResolveContext {
	const { projectId, connectorConfig } = useConfig();
	const metadata = useProject((s) => s.metadata);
	const referenceImages = useProject((s) => s.referenceImages);
	return useMemo(
		() => ({
			projectId,
			registry: connectorConfig,
			state: { metadata, referenceImages },
		}),
		[projectId, connectorConfig, metadata, referenceImages],
	);
}
