"use client";

import type { ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useGenerate } from "../hooks/useGenerate";

type ElementGeneration = ReturnType<typeof useGenerate>;

const [ElementGenerationContext, useElementGeneration] =
	createRequiredContext<ElementGeneration>("ElementGenerationContext");
export { useElementGeneration };

// One subscription, one staleness check and one restore effect per element card.
// Children are passed through untouched, so a queue tick re-renders only the
// consumers below, not the Slate-managed subtree.
export function ElementGenerationProvider({
	element,
	children,
}: {
	element: CanvasContentElement;
	children: ReactNode;
}) {
	const generation = useGenerate(element);
	return (
		<ElementGenerationContext value={generation}>
			{children}
		</ElementGenerationContext>
	);
}
