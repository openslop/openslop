"use client";

import type { ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { ProjectStore } from "./store";

const [ProjectStoreContext, useProjectStoreHandle] =
	createRequiredContext<ProjectStore>("ProjectStoreProvider");
export { useProjectStoreHandle };

export function ProjectStoreProvider({
	store,
	children,
}: {
	store: ProjectStore;
	children: ReactNode;
}) {
	return <ProjectStoreContext value={store}>{children}</ProjectStoreContext>;
}
