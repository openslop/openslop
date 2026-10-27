"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { getCanvasElements } from "@/lib/canvas/assets";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { buildSettings, type BuildContext } from "./graph";

/** Reads the canvas and the settings per call, so an edit never re-renders the caller. */
export function useBuildContext(): () => BuildContext {
	const store = useProjectStoreHandle();
	const editor = useSlateStatic();
	return useCallback(
		() => ({
			settings: buildSettings(store.getState()),
			canvas: getCanvasElements(editor.children),
			registry: DEFAULT_CONNECTOR_REGISTRY,
		}),
		[store, editor],
	);
}
