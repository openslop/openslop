"use client";

import { useMemo } from "react";
import { useSlateSelector } from "slate-react";
import { getContentElements } from "@/lib/canvas/scenes";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/**
 * A node is a pure function of the document and the project state, so the
 * builder is keyed on exactly those and builds against the document it was
 * keyed to. Reading the live document instead would let one builder answer
 * with nodes from two versions, and a graph memoized on the builder would go
 * on holding another element as that element used to be: its dependent then
 * reads it as needing generation forever, however current it really is.
 *
 * Slate swaps `children` for every document edit and leaves it alone when only
 * the selection moves, so its identity is the document's revision.
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
