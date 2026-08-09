import type { GenerationContext } from "@/lib/connectors/types";
import type { ProjectStore } from "@/lib/project/store";

/** The generation context the queue builds: state frozen at graph-resolve time. */
export const stateCtx = (store: ProjectStore): GenerationContext => ({
	state: store.getState(),
});
