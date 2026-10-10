"use client";

import { useCallback } from "react";
import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import type { GeneratedElement } from "@/lib/canvas/types";
import type { GenerationNode } from "./graph";
import { useResolveNode } from "./live-graph-provider";

export function useLiveNode(element: GeneratedElement): GenerationNode {
	const resolve = useResolveNode();
	const read = useCallback(() => resolve(element), [resolve, element]);
	return useSlateSelector(read);
}

/** Memoize `elements`. */
export function useLiveNodes(
	elements: () => GeneratedElement[],
): GenerationNode[] {
	const resolve = useResolveNode();
	const read = useCallback(() => elements().map(resolve), [resolve, elements]);
	return useSlateSelector(read, shallow);
}
