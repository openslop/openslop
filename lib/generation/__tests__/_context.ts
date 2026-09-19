import { createProjectStore } from "@/lib/project/store";
import type { BuildContext } from "../graph";

/** What a job runs against when the test reads neither project nor canvas. */
export const EMPTY_CONTEXT: BuildContext = {
	state: createProjectStore().getState(),
	canvas: [],
};
