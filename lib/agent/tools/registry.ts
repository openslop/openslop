import type { z } from "zod";
import { errorMessage } from "@/lib/errors";
import type { AgentToolContext } from "./context";
import { editScript } from "./editScript";
import { readScript } from "./readScript";
import { setCharacter } from "./setCharacter";
import { setMetadata } from "./setMetadata";
import { setNarrator } from "./setNarrator";
import { writeScript } from "./writeScript";
import { agentToolCallSchema } from "./specs";

type AgentToolCall = z.infer<typeof agentToolCallSchema>;

/** A failure is reported, not thrown: the model reads it as the next observation. */
export type ToolOutcome =
	| { ok: true; output: string }
	| { ok: false; errorText: string };

function run(call: AgentToolCall, ctx: AgentToolContext): Promise<string> {
	switch (call.toolName) {
		case "read_script":
			return readScript(ctx);
		case "edit_script":
			return editScript(call.input, ctx);
		case "write_script":
			return writeScript(call.input, ctx);
		case "set_metadata":
			return setMetadata(call.input, ctx);
		case "set_narrator":
			return setNarrator(call.input, ctx);
		case "set_character":
			return setCharacter(call.input, ctx);
	}
}

export async function executeToolCall(
	call: { toolName: string; input: unknown },
	ctx: AgentToolContext,
): Promise<ToolOutcome> {
	const parsed = agentToolCallSchema.safeParse(call);
	if (!parsed.success) {
		return {
			ok: false,
			errorText: `${call.toolName} cannot take that input: ${parsed.error.message}`,
		};
	}

	try {
		return { ok: true, output: await run(parsed.data, ctx) };
	} catch (error) {
		return { ok: false, errorText: errorMessage(error) };
	}
}
