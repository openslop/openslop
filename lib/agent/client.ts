import type { ModelRef } from "@/lib/connectors/types";
import { apiPrefixFor } from "@/lib/gateway/prefix";

export const agentPathFor = (model: ModelRef): string =>
	`${apiPrefixFor(model.provider)}/agent`;
