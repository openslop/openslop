"use client";

import type { ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useGenerate } from "../hooks/useGenerate";

type ElementGeneration = ReturnType<typeof useGenerate> & {
	element: CanvasContentElement;
};

const [ElementGenerationContext, useElementGeneration] =
	createRequiredContext<ElementGeneration>("ElementGenerationContext");
export { useElementGeneration };

// One subscription, one staleness check and one restore effect per element card.
// Children are passed through untouched, so a queue tick re-renders only the
// consumers below, not the Slate-managed subtree. The element rides along so
// card-scoped controls read it here instead of taking it as a prop.
export function ElementGenerationProvider({
	element,
	children,
}: {
	element: CanvasContentElement;
	children: ReactNode;
}) {
	const generation = useGenerate(element);
	return (
		<ElementGenerationContext value={{ ...generation, element }}>
			{children}
		</ElementGenerationContext>
	);
}
