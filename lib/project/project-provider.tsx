"use client";

import type { ReactNode } from "react";
import type { SloppyMessage } from "@/lib/agent/types";
import { createRequiredContext } from "@/lib/components/create-required-context";

type LoadedProject = {
	projectId: string;
	initialScript: string;
	initialTranscript: SloppyMessage[];
};

const [LoadedProjectContext, useLoadedProject] =
	createRequiredContext<LoadedProject>("ProjectProvider");

export const useProjectId = () => useLoadedProject().projectId;
export const useInitialScript = () => useLoadedProject().initialScript;
export const useInitialTranscript = () => useLoadedProject().initialTranscript;

/** What the page loaded and no store below owns. */
export function ProjectProvider({
	projectId,
	initialScript,
	initialTranscript,
	children,
}: LoadedProject & { children: ReactNode }) {
	return (
		<LoadedProjectContext
			value={{ projectId, initialScript, initialTranscript }}
		>
			{children}
		</LoadedProjectContext>
	);
}
