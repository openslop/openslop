"use client";

import { createContext, use } from "react";

export type RefineChangeKind = "added" | "modified" | "removed";
export type RefineChanges = Record<string, RefineChangeKind>;

/**
 * Per-element diff markers from the most recent applied refine: which content
 * nodes were added or modified, so the editor can highlight exactly what
 * changed (like a diff gutter). Set by useRefineScript on apply, cleared on the
 * next refine or undo. Removed nodes are gone from the doc, so they aren't
 * marked here — the refine summary reports their count.
 */
export const RefineChangesContext = createContext<RefineChanges>({});

export function useRefineChanges() {
	return use(RefineChangesContext);
}
