"use client";

import { useMemo, useState, type ReactNode } from "react";
import { isScriptEmpty } from "@/lib/canvas/scenes";
import { createRequiredContext } from "@/lib/components/create-required-context";
import { deserializeWithScenes } from "@/lib/project/serialize";

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
	const [showWorkspace, setShowWorkspace] = useState(
		() => !isScriptEmpty(deserializeWithScenes(initialScript)),
	);

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
