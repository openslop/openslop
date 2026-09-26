"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { getContentElements } from "@/lib/canvas/scenes";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import type { BuildContext } from "./graph";

/**
 * The canvas is read when the context is made, not when the hook renders, so a
 * document edit never re-renders the caller. Project state is subscribed to: a
 * build reads it, and nothing else would rebuild when it changes.
 */
export function useBuildContext(): () => BuildContext {
	const { connectorConfig: registry } = useConfig();
	const state = useProject((store) => store);
	const editor = useSlateStatic();
	return useCallback(
		() => ({ state, canvas: getContentElements(editor.children), registry }),
		[registry, state, editor],
	);
}
