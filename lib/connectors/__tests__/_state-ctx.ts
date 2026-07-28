import type { GenerationContext } from "@/lib/connectors/types";
import { projectState } from "@/lib/generation/sourceNodes";

/** The generation context the queue builds: state frozen at graph-resolve time. */
export const stateCtx = (projectId: string): GenerationContext => ({
	state: projectState(projectId),
});
