"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { getCanvasElements } from "@/lib/canvas/assets";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { buildSettings, type BuildContext } from "./graph";

/** Reads the canvas and the settings per call, so a job built late never runs on what it was queued with. */
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
