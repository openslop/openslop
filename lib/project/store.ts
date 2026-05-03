import { enableMapSet } from "immer";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { DeepPartial, Metadata } from "./types";

enableMapSet();

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== "object") return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

function deepMerge(
	target: Record<string, unknown>,
	source: Record<string, unknown>,
): void {
	for (const [key, value] of Object.entries(source)) {
		if (value === undefined) continue;
		const current = target[key];
		if (isPlainObject(value) && isPlainObject(current)) {
			deepMerge(current, value);
		} else {
			target[key] = value;
		}
	}
}

export type ProjectContext = {
	metadata: Metadata;
	referenceImages: string[];
	generatingAvatars: ReadonlySet<string>;
	updateMetadata: (partial: DeepPartial<Metadata>) => void;
	setReferenceImages: (urls: string[]) => void;
	setAvatarGenerating: (name: string, generating: boolean) => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const stores = new Map<string, ProjectStore>();

export function getProjectStore(projectId: string): ProjectStore {
	let store = stores.get(projectId);
	if (!store) {
		store = createStore<ProjectContext>()(
			immer((set) => ({
				metadata: { title: "", style: "", narration: {}, characters: {} },
				referenceImages: [],
				generatingAvatars: new Set(),
				updateMetadata: (partial) =>
					set((state) => {
						deepMerge(
							state.metadata as unknown as Record<string, unknown>,
							partial as Record<string, unknown>,
						);
					}),
				setReferenceImages: (urls) =>
					set((state) => {
						state.referenceImages = urls;
					}),
				setAvatarGenerating: (name, generating) =>
					set((state) => {
						if (generating) state.generatingAvatars.add(name);
						else state.generatingAvatars.delete(name);
					}),
			})),
		);
		stores.set(projectId, store);
	}
	return store;
}

export function clearProjectStore(projectId: string) {
	stores.delete(projectId);
}

export function useProjectStore<T>(
	projectId: string,
	selector: (state: ProjectContext) => T,
): T {
	return useStore(getProjectStore(projectId), selector);
}
