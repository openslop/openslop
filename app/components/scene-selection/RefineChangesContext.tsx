"use client";

import { createContext, use } from "react";

export type RefineChangeKind = "added" | "modified" | "removed";
export type RefineChanges = Record<string, RefineChangeKind>;

/**
 * Per-element diff markers for the current pending refine preview: which content
 * nodes the agent added, modified, or removed (added/modified are tinted,
 * removed is struck through and held in place until Apply). Set when the
 * preview's ops land, cleared on apply, discard, or the next refine.
 */
export const RefineChangesContext = createContext<RefineChanges>({});

export function useRefineChanges() {
	return use(RefineChangesContext);
}
