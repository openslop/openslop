import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createProjectStore } from "@/lib/project/store";
import type { BuildContext } from "../graph";

const store = createProjectStore();

/** What a job runs against when the test reads neither project nor canvas. */
export const EMPTY_CONTEXT: BuildContext = {
	store,
	state: store.getState(),
	canvas: [],
	registry: DEFAULT_CONNECTOR_REGISTRY,
};
