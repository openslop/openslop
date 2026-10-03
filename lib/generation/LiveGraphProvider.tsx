"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { ScriptElement } from "@/lib/canvas/types";
import type { GenerationNode } from "./graph";
import { createGraphFor } from "./generationGraph";
import { useBuildContext } from "./useBuildContext";

const [LiveGraphContext, useResolveNode] =
	createRequiredContext<(element: ScriptElement) => GenerationNode>(
		"LiveGraphContext",
	);
export { useResolveNode };

export function LiveGraphProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const buildContext = useBuildContext();
	const [graphFor] = useState(createGraphFor);

	const resolve = useCallback(
		(element: ScriptElement) =>
			graphFor(editor.children, buildContext).resolve(element),
		[editor, graphFor, buildContext],
	);

	return <LiveGraphContext value={resolve}>{children}</LiveGraphContext>;
}
