"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { getScriptElements } from "@/lib/canvas/assets";
import { setAsset } from "@/lib/canvas/assetOps";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import type { BuildContext } from "./graph";

/** Reads the canvas per call so an edit never re-renders the caller; settings changes must rebuild. */
export function useBuildContext(): () => BuildContext {
	const { connectorConfig: registry } = useConfig();
	const videoSettings = useProject((state) => state.videoSettings);
	const scriptSettings = useProject((state) => state.scriptSettings);
	const models = useProject((state) => state.models);
	const editor = useSlateStatic();
	return useCallback(
		() => ({
			state: { videoSettings, scriptSettings, models },
			canvas: getScriptElements(editor.children),
			registry,
			setAsset: ({ type, name, attrs }) =>
				setAsset(editor, type, name, { attrs }),
		}),
		[registry, videoSettings, scriptSettings, models, editor],
	);
}
