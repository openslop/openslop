"use client";

import type { ReactNode } from "react";
import type { SloppyMessage } from "@/lib/agent/types";
import { createRequiredContext } from "@/lib/components/create-required-context";

type LoadedProject = {
	projectId: string;
	initialTranscript: SloppyMessage[];
};

const [LoadedProjectContext, useLoadedProject] =
	createRequiredContext<LoadedProject>("ProjectProvider");

export const useProjectId = () => useLoadedProject().projectId;
export const useInitialTranscript = () => useLoadedProject().initialTranscript;

/** What the page loaded and no store below owns: the row's id and its Sloppy transcript. */
export function ProjectProvider({
	projectId,
	initialTranscript,
	children,
}: LoadedProject & { children: ReactNode }) {
	return (
		<LoadedProjectContext value={{ projectId, initialTranscript }}>
			{children}
		</LoadedProjectContext>
	);
}
