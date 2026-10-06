"use client";

import { useSlateStatic } from "slate-react";
import { BLANK_SCRIPT } from "@/lib/project/serialize";
import { useOpenWorkspace } from "./ScriptProvider";
import { createScriptWriter } from "./scriptWriter";

export function useStartBlank(): () => void {
	const editor = useSlateStatic();
	const openWorkspace = useOpenWorkspace();

	return () => {
		openWorkspace();
		createScriptWriter(editor)(BLANK_SCRIPT);
	};
}
