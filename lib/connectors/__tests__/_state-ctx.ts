import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { PluginContext } from "@/lib/connectors/types";
import type { ProjectStore } from "@/lib/project/store";

/** The context a tts connector runs its plugins with: state frozen at graph-resolve time, and its own pair. */
export const stateCtx = <P, R>(store: ProjectStore): PluginContext<P, R> => ({
	state: store.getState(),
	model: DEFAULT_MODELS.tts,
});
