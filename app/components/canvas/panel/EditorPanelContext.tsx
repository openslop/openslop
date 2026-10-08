"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useShowWorkspace } from "@/lib/script/ScriptProvider";
import type { PanelKey } from "./panelKeys";

type EditorPanelValue = {
	active: PanelKey | null;
	setActive: (key: PanelKey | null) => void;
};

const [EditorPanelContext, useEditorPanel] =
	createRequiredContext<EditorPanelValue>("EditorPanelProvider");
export { useEditorPanel };

/** One panel open at a time, so the rail's exclusivity is the state, not a rule. */
export function EditorPanelProvider({ children }: { children: ReactNode }) {
	const showWorkspace = useShowWorkspace();
	const [active, setActive] = useState<PanelKey | null>(
		showWorkspace ? null : "sloppy",
	);

	const value = useMemo(() => ({ active, setActive }), [active]);
	return <EditorPanelContext value={value}>{children}</EditorPanelContext>;
}
