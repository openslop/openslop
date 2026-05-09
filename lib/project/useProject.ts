"use client";

import { useConfig } from "@/lib/config/ConfigProvider";
import { type ProjectContext, useProjectStore } from "./store";

export function useProject<T>(selector: (state: ProjectContext) => T): T {
	const { projectId } = useConfig();
	return useProjectStore(projectId, selector);
}
