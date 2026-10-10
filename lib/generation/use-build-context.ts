"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { getCanvasElements } from "@/lib/canvas/assets";
import { useConfig } from "@/lib/config/config-provider";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { buildSettings, type BuildContext } from "./graph";

/** Reads the canvas and the settings per call, so an edit never re-renders the caller. */
export function useBuildContext(): () => BuildContext {
	const { connectorConfig: registry } = useConfig();
	const store = useProjectStoreHandle();
	const editor = useSlateStatic();
	return useCallback(
		() => ({
			state: buildSettings(store.getState()),
			canvas: getCanvasElements(editor.children),
			registry,
		}),
		[registry, store, editor],
	);
}
