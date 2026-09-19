"use client";

import memoize from "lodash/memoize";
import { useMemo } from "react";
import { useSlateStatic } from "slate-react";
import { getContentElements } from "@/lib/canvas/scenes";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import type { BuildContext } from "./graph";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

// One canvas per document revision, so builds against the same document share nodes.
const canvasOf = memoize(getContentElements);
canvasOf.cache = new WeakMap();

/**
 * `build` reads the project and canvas when it builds, not when it rendered, so
 * a node always describes the document as it is and no component re-renders
 * for an edit it does not read. `context` is what those nodes run against.
 */
export function useNodeBuilder(): {
	build: NodeBuilder;
	context: () => BuildContext;
} {
	const { connectorConfig } = useConfig();
	const state = useProject((store) => store);
	const editor = useSlateStatic();
	return useMemo(() => {
		const context = () => ({ state, canvas: canvasOf(editor.children) });
		return { build: nodeBuilder(connectorConfig, context), context };
	}, [connectorConfig, state, editor]);
}
