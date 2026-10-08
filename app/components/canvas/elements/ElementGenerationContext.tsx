"use client";

import type { ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { GeneratedElement } from "@/lib/canvas/types";
import { useGenerate } from "../hooks/useGenerate";

type ElementGeneration = ReturnType<typeof useGenerate>;

const [ElementGenerationContext, useElementGeneration] =
	createRequiredContext<ElementGeneration>("ElementGenerationContext");
export { useElementGeneration };

/** One subscription per element; children pass through, so a queue tick re-renders only the consumers. */
export function ElementGenerationProvider({
	element,
	children,
}: {
	element: GeneratedElement;
	children: ReactNode;
}) {
	const generation = useGenerate(element);
	return (
		<ElementGenerationContext value={generation}>
			{children}
		</ElementGenerationContext>
	);
}
