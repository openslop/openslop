"use client";

import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";
import { getTemplateById } from "@/lib/templates/templates";

export type Mode = "story" | "script" | "template";

export type CopilotState = {
	value: string;
	referenceImages: string[];
	mode: Mode;
	selectedTemplateId?: string;
	submitted: boolean;
	setValue: (value: string) => void;
	setReferenceImages: (urls: string[]) => void;
	setMode: (mode: Mode) => void;
	selectTemplate: (id: string) => void;
	markSubmitted: () => void;
	reset: () => void;
};

export const copilotStore = createStore<CopilotState>()(
	immer((set) => ({
		value: "",
		referenceImages: [],
		mode: "story",
		submitted: false,
		setValue: (value) =>
			set((s) => {
				s.value = value;
			}),
		setReferenceImages: (urls) =>
			set((s) => {
				s.referenceImages = urls;
			}),
		setMode: (mode) =>
			set((s) => {
				s.mode = mode;
			}),
		selectTemplate: (id) =>
			set((s) => {
				s.mode = "template";
				s.selectedTemplateId = id;
				s.referenceImages = getTemplateById(id)?.referenceImages ?? [];
			}),
		markSubmitted: () =>
			set((s) => {
				s.submitted = true;
			}),
		reset: () =>
			set((s) => {
				s.value = "";
				s.referenceImages = [];
			}),
	})),
);

export function useCopilotStore<T>(selector: (s: CopilotState) => T): T {
	return useStore(copilotStore, selector);
}
