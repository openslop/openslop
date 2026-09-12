"use client";

import { useMemo } from "react";
import { useSlateStatic } from "slate-react";
import { elementLookup } from "@/lib/canvas/editorOps";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/**
 * Rebuilt on any store write, so reading something new costs only a source
 * node. The canvas is read through the editor at build time, not captured.
 */
export function useNodeBuilder(): NodeBuilder {
	const { connectorConfig } = useConfig();
	const state = useProject((store) => store);
	const editor = useSlateStatic();
	return useMemo(
		() => nodeBuilder(connectorConfig, state, elementLookup(editor)),
		[connectorConfig, state, editor],
	);
}
