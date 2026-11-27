import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { LanguageModelV3FunctionTool } from "@ai-sdk/provider";
import * as acp from "@agentclientprotocol/sdk";
import { logger } from "@/lib/api/logger";
import { agentFor, type Agent } from "./agents";
import { serveTools, type ToolCall } from "./tool-server";

export type AgentEvent =
	| { type: "text"; delta: string }
	| { type: "reasoning"; delta: string }
	| ({ type: "tool-call" } & ToolCall)
	| { type: "stop"; stopReason: acp.StopReason };

const AUTH_REQUIRED = -32000;

function explained(error: unknown): unknown {
	return error instanceof acp.RequestError && error.code === AUTH_REQUIRED
		? new Error("Sign in to this agent in a terminal, then retry.", {
				cause: error,
			})
		: error;
}

function chunk({ update }: { update: acp.SessionUpdate }): AgentEvent | null {
	switch (update.sessionUpdate) {
		case "agent_message_chunk":
			return update.content.type === "text"
				? { type: "text", delta: update.content.text }
				: null;
		case "agent_thought_chunk":
			return update.content.type === "text"
				? { type: "reasoning", delta: update.content.text }
				: null;
		default:
			return null;
	}
}

function end({ context, capabilities }: Agent, session: acp.ActiveSession) {
	const { sessionId } = session;
	const warn = (error: unknown) =>
		logger.warn(error, "Local agent session cleanup");
	context.notify(acp.methods.agent.session.cancel, { sessionId }).catch(warn);
	if (capabilities.sessionCapabilities?.close)
		context.request(acp.methods.agent.session.close, { sessionId }).catch(warn);
	session.dispose();
}

/** One prompt in a fresh session, until the agent ends its turn or calls a tool for the editor to run. */
export async function* promptAgent(
	command: string,
	prompt: string,
	tools: LanguageModelV3FunctionTool[],
): AsyncGenerator<AgentEvent> {
	const agent = await agentFor(command);
	if (tools.length > 0 && !agent.capabilities.mcpCapabilities?.http)
		throw new Error(`\`${command}\` cannot take tools over HTTP MCP.`);
	const called = Promise.withResolvers<ToolCall>();
	const server =
		tools.length > 0 ? await serveTools(tools, called.resolve) : null;
	const cwd = await mkdtemp(join(tmpdir(), "openslop-agent-"));
	try {
		const builder = agent.context.buildSession(cwd);
		const session = await (
			server ? builder.withMcpServer(server.declaration) : builder
		).start();
		try {
			// A failed prompt rejects the next update instead.
			session.prompt(prompt).catch(() => {});
			for (;;) {
				const next = await Promise.race([session.nextUpdate(), called.promise]);
				if ("toolName" in next) return yield { type: "tool-call", ...next };
				if (next.kind === "stop")
					return yield { type: "stop", stopReason: next.stopReason };
				const event = chunk(next);
				if (event) yield event;
			}
		} finally {
			end(agent, session);
		}
	} catch (error) {
		throw explained(error);
	} finally {
		server?.close();
		await rm(cwd, { recursive: true, force: true });
	}
}
