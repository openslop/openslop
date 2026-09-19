"use client";

import { useSlateSelector } from "slate-react";
import { isSameGraph, type GenerationNode } from "./graph";

/**
 * The node returned by `build`, built again on every editor change. If the new
 * node reads the same inputs and edges as before, the old one is kept and
 * nothing re-renders. Its `job` is not compared, so it may lag the connector
 * config: build again before running a node.
 */
export const useLiveNode = (build: () => GenerationNode): GenerationNode =>
	useSlateSelector(build, isSameGraph);

export const useLiveNodes = (build: () => GenerationNode[]): GenerationNode[] =>
	useSlateSelector(build, isSameGraph);
