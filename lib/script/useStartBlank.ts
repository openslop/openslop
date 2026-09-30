"use client";

import { useSlateStatic } from "slate-react";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { BLANK_SCRIPT } from "@/lib/project/serialize";
import { useOpenWorkspace } from "./ScriptProvider";
import { createScriptWriter } from "./streamScript";

export function useStartBlank(): () => void {
	const editor = useSlateStatic();
	const store = useProjectStoreHandle();
	const defaultModels = useResolveDefaultModels();
	const openWorkspace = useOpenWorkspace();

	return () => {
		store.getState().updateMetadata({ title: "Untitled" });
		openWorkspace();
		createScriptWriter({ editor, store, defaultModels })(BLANK_SCRIPT);
	};
}
