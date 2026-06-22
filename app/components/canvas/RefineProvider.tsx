"use client";

import type { ReactNode } from "react";
import type { Editor } from "slate";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useRefineScript } from "./hooks/useRefineScript";

type RefineContextValue = ReturnType<typeof useRefineScript>;

const [RefineContext, useRefine] =
	createRequiredContext<RefineContextValue>("RefineProvider");
export { useRefine };

export function RefineProvider({
	editor,
	children,
}: {
	editor: Editor;
	children: ReactNode;
}) {
	const refine = useRefineScript(editor);
	return <RefineContext value={refine}>{children}</RefineContext>;
}
