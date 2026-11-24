import {
	InvalidToolInputError,
	JSONParseError,
	type ToolCallRepairFunction,
	type ToolSet,
} from "ai";
import { jsonrepair } from "jsonrepair";

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
		return { ...toolCall, input: jsonrepair(toolCall.input) };
	} catch {
		return null;
	}
};
