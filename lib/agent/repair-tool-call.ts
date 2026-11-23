import {
	InvalidToolInputError,
	JSONParseError,
	type ToolCallRepairFunction,
	type ToolSet,
} from "ai";
import { jsonrepair } from "jsonrepair";

/** Only a repair that drops characters is trusted: one that adds them may be completing a truncated call. */
export const repairToolCall: ToolCallRepairFunction<ToolSet> = async ({
	toolCall,
	error,
}) => {
	if (
		!InvalidToolInputError.isInstance(error) ||
		!JSONParseError.isInstance(error.cause)
	) {
		return null;
	}
	try {
		const input = jsonrepair(toolCall.input);
		return input.length < toolCall.input.length ? { ...toolCall, input } : null;
	} catch {
		return null;
	}
};
