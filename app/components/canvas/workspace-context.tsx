"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { isScriptEmpty } from "@/lib/canvas/scenes";
import { createRequiredContext } from "@/lib/components/create-required-context";

type Workspace = {
	showWorkspace: boolean;
	openWorkspace: () => void;
};

const [WorkspaceContext, useWorkspace] =
	createRequiredContext<Workspace>("WorkspaceProvider");

export const useShowWorkspace = () => useWorkspace().showWorkspace;
export const useOpenWorkspace = () => useWorkspace().openWorkspace;

/** The composer shows until the document has content or the user skips past it. */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const [showWorkspace, setShowWorkspace] = useState(
		() => !isScriptEmpty(editor.children),
	);

	const value = useMemo(
		() => ({ showWorkspace, openWorkspace: () => setShowWorkspace(true) }),
		[showWorkspace],
	);

	return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
}
