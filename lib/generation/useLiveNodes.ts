"use client";

import { useSlateSelector } from "slate-react";
import { areSameGraphs, isSameGraph, type GenerationNode } from "./graph";

/**
 * The node returned by `build`, built again on every editor change. If the new
 * node reads the same inputs and edges as before, the old one is kept and
 * nothing re-renders.
 */
export const useLiveNode = (build: () => GenerationNode): GenerationNode =>
	useSlateSelector(build, isSameGraph);

export const useLiveNodes = (build: () => GenerationNode[]): GenerationNode[] =>
	useSlateSelector(build, areSameGraphs);
