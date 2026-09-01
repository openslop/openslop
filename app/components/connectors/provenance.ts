import type { ModelSource } from "@/lib/connectors/models";

/** Where a model came from, for the hint shown wherever one is displayed. */
export const MODEL_PROVENANCE: Record<ModelSource, string> = {
	element: "Chosen on this element",
	project: "Inherited from this project",
	account: "Inherited from your account",
	recommended: "OpenSlop's recommended default",
};
