import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createProjectStore } from "@/lib/project/store";
import type { BuildContext } from "../graph";

/** What a job runs against when the test reads neither project nor canvas. */
export const EMPTY_CONTEXT: BuildContext = {
	state: createProjectStore().getState(),
	canvas: [],
	registry: DEFAULT_CONNECTOR_REGISTRY,
};
