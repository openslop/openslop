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

/** The scopes a model default can come from here, nearest first. */
export function useModelChain(): ModelDefaults {
	const project = useProject((state) => state.metadata.connectorModels);
	const account = useAccount((state) => state.models);
	return useMemo(() => ({ project, account }), [project, account]);
}

/**
 * The model each connector type resolves to here: the project's pick, then the
 * account's, then what OpenSlop recommends. New elements take theirs from this.
 */
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
				project: project.getState().metadata.connectorModels,
				account: account.getState().models,
			}),
		[project, account],
	);
}
