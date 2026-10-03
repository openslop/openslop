"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { getScriptElements } from "@/lib/canvas/assets";
import { setAsset } from "@/lib/canvas/assetOps";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import type { BuildContext } from "./graph";

/** Reads the canvas per call so an edit never re-renders the caller; store changes must rebuild. */
export function useBuildContext(): () => BuildContext {
	const { connectorConfig: registry } = useConfig();
	const state = useProject((store) => store);
	const editor = useSlateStatic();
	return useCallback(
		() => ({
			state,
			canvas: getScriptElements(editor.children),
			registry,
			setAsset: ({ type, name, attrs }) =>
				setAsset(editor, type, name, { attrs }),
		}),
		[registry, state, editor],
	);
}
