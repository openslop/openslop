"use client";

import { useCallback } from "react";
import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import type { GenerationNode, NodeSpec } from "./graph";
import { useResolveNode } from "./LiveGraphProvider";

/** `job` is not compared, so it may be stale: rebuild before running a node. */
export function useLiveNode(spec: NodeSpec): GenerationNode {
	const resolve = useResolveNode();
	const read = useCallback(() => resolve(spec), [resolve, spec]);
	return useSlateSelector(read);
}

/** Memoize `specs`. */
export function useLiveNodes(specs: () => NodeSpec[]): GenerationNode[] {
	const resolve = useResolveNode();
	const read = useCallback(() => specs().map(resolve), [resolve, specs]);
	return useSlateSelector(read, shallow);
}
