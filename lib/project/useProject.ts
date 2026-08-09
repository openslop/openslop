"use client";

import { useStore } from "zustand";
import { useProjectStoreHandle } from "./ProjectStoreProvider";
import type { ProjectContext } from "./store";

export function useProject<T>(selector: (state: ProjectContext) => T): T {
	const store = useProjectStoreHandle();
	return useStore(store, selector);
}
