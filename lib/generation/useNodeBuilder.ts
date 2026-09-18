"use client";

import { useMemo } from "react";
import { useSlateSelector } from "slate-react";
import { getContentElements } from "@/lib/canvas/scenes";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/**
 * Builds from a snapshot of the document, not the live one, so a builder never
 * sees a half-edited canvas. `children` changes on every edit but not on a
 * selection change, so it is a cheap way to know when to rebuild.
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
