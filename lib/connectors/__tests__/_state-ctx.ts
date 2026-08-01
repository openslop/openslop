import type { GenerationContext } from "@/lib/connectors/types";
import { getProjectStore } from "@/lib/project/store";

/** The generation context the queue builds: state frozen at graph-resolve time. */
export const stateCtx = (projectId: string): GenerationContext => ({
	state: getProjectStore(projectId).getState(),
});
