"use client";

import { useMemo } from "react";
import { useProject } from "@/lib/project/useProject";
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
