"use client";

import { useMemo, useState, type ReactNode } from "react";
import omit from "lodash/omit";
import { createRequiredContext } from "@/lib/components/create-required-context";
import { useShowWorkspace } from "../workspace-context";
import type { PanelKey } from "./panel-keys";

type Notices = Partial<Record<PanelKey, string>>;

type EditorPanelValue = {
	active: PanelKey | null;
	setActive: (key: PanelKey | null) => void;
	/** What a closed panel has waiting, worded for a screen reader; opening it clears the notice. */
	notices: Notices;
	notify: (key: PanelKey, notice: string) => void;
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
	const [notices, setNotices] = useState<Notices>({});

	const value = useMemo<EditorPanelValue>(
		() => ({
			active,
			setActive: (key) => {
				setActive(key);
				if (key) setNotices((seen) => (key in seen ? omit(seen, key) : seen));
			},
			notices,
			notify: (key, notice) => {
				if (key !== active) setNotices((seen) => ({ ...seen, [key]: notice }));
			},
		}),
		[active, notices],
	);
	return <EditorPanelContext value={value}>{children}</EditorPanelContext>;
}
