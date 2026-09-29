"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { GenerationNode, NodeSpec } from "./graph";
import { liveGraph } from "./liveGraph";
import { useBuildContext } from "./useBuildContext";

const [LiveGraphContext, useLiveGraph] =
	createRequiredContext<(spec: NodeSpec) => GenerationNode>("LiveGraphContext");
export { useLiveGraph };

/** One graph for each document, so it sits inside that document's `<Slate>`. */
export function LiveGraphProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const context = useBuildContext();
	const [graph] = useState(() => liveGraph(editor));
	const resolve = useCallback(
		(spec: NodeSpec) => graph(spec, context),
		[graph, context],
	);
	return <LiveGraphContext value={resolve}>{children}</LiveGraphContext>;
}
