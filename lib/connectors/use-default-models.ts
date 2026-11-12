"use client";

import { useMemo } from "react";
import { useProject } from "@/lib/project/use-project";
import { useAccount } from "@/lib/user/use-account";
import {
	resolveDefaultModels,
	type ModelDefaults,
	type ResolvedModels,
} from "./models";

export function useModelChain(): ModelDefaults {
	const project = useProject((state) => state.models);
	const account = useAccount((state) => state.models);
	return useMemo(() => ({ project, account }), [project, account]);
}

export function useDefaultModels(): ResolvedModels {
	const chain = useModelChain();
	return useMemo(() => resolveDefaultModels(chain), [chain]);
}
