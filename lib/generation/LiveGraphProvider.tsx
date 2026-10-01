"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { GenerationNode, NodeSpec } from "./graph";
import { createGraphFor } from "./generationGraph";
import { useBuildContext } from "./useBuildContext";

const [LiveGraphContext, useResolveNode] =
	createRequiredContext<(spec: NodeSpec) => GenerationNode>("LiveGraphContext");
export { useResolveNode };

export function LiveGraphProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const context = useBuildContext();
	const [graphFor] = useState(createGraphFor);

	const resolve = useCallback(
		(spec: NodeSpec) => graphFor(editor.children, context).resolve(spec),
		[editor, graphFor, context],
	);

	return <LiveGraphContext value={resolve}>{children}</LiveGraphContext>;
}
