"use client";

import memoize from "lodash/memoize";
import { useMemo } from "react";
import { useSlateStatic } from "slate-react";
import { getContentElements } from "@/lib/canvas/scenes";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

// One canvas per document revision, so builds against the same document share nodes.
const canvasOf = memoize(getContentElements);
canvasOf.cache = new WeakMap();

/**
 * Reads the canvas when it builds, not when it renders: a build always sees the
 * document as it is, and no component re-renders for an edit it does not read.
 */
export function useNodeBuilder(): NodeBuilder {
	const { connectorConfig } = useConfig();
	const state = useProject((store) => store);
	const editor = useSlateStatic();
	return useMemo(
		() => nodeBuilder(connectorConfig, state, () => canvasOf(editor.children)),
		[connectorConfig, state, editor],
	);
}
