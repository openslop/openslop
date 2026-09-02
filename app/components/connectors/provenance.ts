import type { ModelSource } from "@/lib/connectors/models";

export const MODEL_PROVENANCE: Record<ModelSource, string> = {
	element: "Chosen on this element",
	project: "Inherited from this project",
	account: "Inherited from your account",
	recommended: "OpenSlop's recommended default",
};
