"use client";

import { useState, type ReactNode } from "react";
import { createStore, type StoreApi } from "zustand/vanilla";
import { createStoreContext } from "@/lib/store/createStoreContext";

export const ACTIVE_SCENE_CLASS = "scene-active bg-element-card";

// A store, not a context value, so a change re-renders only the two scenes it flips.
const [ActiveSceneContext, useActiveSceneStore, useActiveSceneSelector] =
	createStoreContext<StoreApi<string | null>>("ActiveSceneContext");

export function useIsActiveScene(sceneId: string): boolean {
	return useActiveSceneSelector((store) => store.getState() === sceneId);
}

export function useSetActiveSceneId(): (id: string | null) => void {
	return useActiveSceneStore().setState;
}

export function ActiveSceneProvider({ children }: { children: ReactNode }) {
	const [store] = useState(() => createStore<string | null>(() => null));
	return <ActiveSceneContext value={store}>{children}</ActiveSceneContext>;
}
