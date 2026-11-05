"use client";

import { useCallback } from "react";
import { useProjectId } from "@/lib/project/project-provider";
import { createConnector } from "./factory";
import type { ConnectorType, ModelRef } from "./types";

/** Connectors created in the editor book their spend to the open project. */
export function useCreateConnector() {
	const projectId = useProjectId();
	return useCallback(
		<T extends ConnectorType>(type: T, model: ModelRef) =>
			createConnector(type, model, projectId),
		[projectId],
	);
}
