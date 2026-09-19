"use client";

import { useSlateSelector } from "slate-react";
import { isSameGraph, type GenerationNode } from "./graph";

/** `job` is not compared, so it may be stale: rebuild before running a node. */
export const useLiveNode = (build: () => GenerationNode): GenerationNode =>
	useSlateSelector(build, isSameGraph);

export const useLiveNodes = (build: () => GenerationNode[]): GenerationNode[] =>
	useSlateSelector(build, isSameGraph);
