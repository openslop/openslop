"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { getScriptElements } from "@/lib/canvas/assets";
import { setAsset } from "@/lib/canvas/assetOps";
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
			canvas: getScriptElements(editor.children),
			registry,
			setAsset: ({ type, name, attrs }) =>
				setAsset(editor, type, name, { attrs }),
		}),
		[registry, store, editor],
	);
}
