"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { useShallow } from "zustand/react/shallow";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { GeneratedElement } from "@/lib/canvas/types";
import { useProject } from "@/lib/project/useProject";
import { buildSettings, type GenerationNode } from "./graph";
import { createGraphFor } from "./generationGraph";
import { useBuildContext } from "./useBuildContext";

const [LiveGraphContext, useResolveNode] =
	createRequiredContext<(element: GeneratedElement) => GenerationNode>(
		"LiveGraphContext",
	);
export { useResolveNode };

export function LiveGraphProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const buildContext = useBuildContext();
	const settings = useProject(useShallow(buildSettings));
	const [graphFor] = useState(createGraphFor);

	const resolve = useCallback(
		(element: GeneratedElement) =>
			graphFor(buildContext, editor.children, settings).resolve(element),
		[editor, graphFor, buildContext, settings],
	);

	return <LiveGraphContext value={resolve}>{children}</LiveGraphContext>;
}
