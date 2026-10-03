"use client";

import { useMemo } from "react";
import { useProjectModels } from "@/lib/canvas/useAssets";
import { useAccount } from "@/lib/user/useAccount";
import {
	resolveDefaultModels,
	type ConnectorModels,
	type ModelDefaults,
} from "./models";

export function useModelChain(): ModelDefaults {
	const project = useProjectModels();
	const account = useAccount((state) => state.models);
	return useMemo(() => ({ project, account }), [project, account]);
}

export function useDefaultModels(): ConnectorModels {
	const chain = useModelChain();
	return useMemo(() => resolveDefaultModels(chain), [chain]);
}
