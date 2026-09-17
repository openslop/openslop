"use client";

import { useMemo } from "react";
import { useSlateSelector } from "slate-react";
import { getContentElements } from "@/lib/canvas/scenes";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/**
 * Keyed on the document it builds against rather than reading the live one, so
 * one builder never mixes nodes from two revisions. Slate swaps `children` on
 * every document edit but not on a selection move, so its identity is the
 * revision.
 */
export function useNodeBuilder(): NodeBuilder {
	const { connectorConfig } = useConfig();
	const state = useProject((store) => store);
	const children = useSlateSelector((editor) => editor.children);
	return useMemo(() => {
		const canvas = getContentElements(children);
		return nodeBuilder(connectorConfig, state, () => canvas);
	}, [connectorConfig, state, children]);
}
