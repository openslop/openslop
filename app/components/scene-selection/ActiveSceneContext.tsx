"use client";

import { useState, type ReactNode } from "react";
import { createStoreContext } from "@/lib/store/createStoreContext";
import { createEmitter, type Emitter } from "@/lib/store/emitter";

export const ACTIVE_SCENE_CLASS = "scene-active bg-element-card";

export type ActiveSceneStore = {
	get: () => string | null;
	set: (id: string | null) => void;
	subscribe: Emitter["subscribe"];
};

/**
 * Every scene asks whether it is the active one, and a change flips the answer
 * for two of them. Holding the id in the context would re-render all of them
 * each time the playhead crosses a cut; holding a store re-renders those two.
 */
export function createActiveSceneStore(): ActiveSceneStore {
	const { subscribe, notify } = createEmitter();
	let active: string | null = null;
	return {
		get: () => active,
		set: (id) => {
			if (id === active) return;
			active = id;
			notify();
		},
		subscribe,
	};
}

const [ActiveSceneContext, useActiveSceneStore, useActiveScene] =
	createStoreContext<ActiveSceneStore>("ActiveSceneContext");

export function useIsActiveScene(sceneId: string): boolean {
	return useActiveScene((store) => store.get() === sceneId);
}

export function useSetActiveSceneId(): ActiveSceneStore["set"] {
	return useActiveSceneStore().set;
}

export function ActiveSceneProvider({ children }: { children: ReactNode }) {
	const [store] = useState(createActiveSceneStore);
	return <ActiveSceneContext value={store}>{children}</ActiveSceneContext>;
}
