"use client";

import { useCallback, useMemo } from "react";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useProject } from "@/lib/project/useProject";
import { useAccountStoreHandle } from "@/lib/user/AccountStoreProvider";
import { useAccount } from "@/lib/user/useAccount";
import {
	resolveDefaultModels,
	type ConnectorModels,
	type ModelDefaults,
} from "./models";

export function useModelChain(): ModelDefaults {
	const project = useProject((state) => state.metadata.models);
	const account = useAccount((state) => state.models);
	return useMemo(() => ({ project, account }), [project, account]);
}

export function useDefaultModels(): ConnectorModels {
	const chain = useModelChain();
	return useMemo(() => resolveDefaultModels(chain), [chain]);
}

/**
 * The same resolution, read on demand. For the callbacks and editor plugins
 * that run outside a render and must see the scopes as they are when they fire.
 */
export function useResolveDefaultModels(): () => ConnectorModels {
	const project = useProjectStoreHandle();
	const account = useAccountStoreHandle();
	return useCallback(
		() =>
			resolveDefaultModels({
				project: project.getState().metadata.models,
				account: account.getState().models,
			}),
		[project, account],
	);
}
