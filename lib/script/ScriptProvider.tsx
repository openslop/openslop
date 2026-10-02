"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

type ScriptSession = {
	initialScript: string;
	showWorkspace: boolean;
	openWorkspace: () => void;
};

const [ScriptContext, useScriptSession] =
	createRequiredContext<ScriptSession>("ScriptProvider");

export const useShowWorkspace = () => useScriptSession().showWorkspace;
export const useScriptInitial = () => useScriptSession().initialScript;
export const useOpenWorkspace = () => useScriptSession().openWorkspace;

export function ScriptProvider({
	initialScript,
	children,
}: {
	initialScript: string;
	children: ReactNode;
}) {
	const [script] = useState(initialScript);
	const [showWorkspace, setShowWorkspace] = useState(initialScript.length > 0);

	const session = useMemo(
		() => ({
			initialScript: script,
			showWorkspace,
			openWorkspace: () => setShowWorkspace(true),
		}),
		[script, showWorkspace],
	);

	return <ScriptContext value={session}>{children}</ScriptContext>;
}
