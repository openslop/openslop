"use client";

import { useMemo } from "react";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { canvasOf } from "@/lib/canvas/editorOps";
import { getContentElements } from "@/lib/canvas/scenes";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { nodeBuilder, type NodeBuilder } from "./resolveGraph";

/**
 * Rebuilt on any store write and whenever elements move or come and go, since
 * a node may depend on the element before it. Typing inside an element does
 * not rebuild: the canvas is read at build time, not captured.
 */
export function useNodeBuilder(): NodeBuilder {
	const { connectorConfig } = useConfig();
	const state = useProject((store) => store);
	const editor = useSlateStatic();
	const order = useSlateSelector((e) =>
		getContentElements(e.children)
			.map((element) => element.id)
			.join(","),
	);
	return useMemo(
		() => nodeBuilder(connectorConfig, state, canvasOf(editor)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[connectorConfig, state, editor, order],
	);
}
