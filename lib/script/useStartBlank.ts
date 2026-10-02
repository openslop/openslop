"use client";

import { useSlateStatic } from "slate-react";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { BLANK_SCRIPT } from "@/lib/project/serialize";
import { useOpenWorkspace } from "./ScriptProvider";
import { createScriptWriter } from "./scriptWriter";

export function useStartBlank(): () => void {
	const editor = useSlateStatic();
	const store = useProjectStoreHandle();
	const openWorkspace = useOpenWorkspace();

	return () => {
		store.getState().updateMetadata({ title: "Untitled" });
		openWorkspace();
		createScriptWriter({ editor, store })(BLANK_SCRIPT);
	};
}
