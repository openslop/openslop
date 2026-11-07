// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatOnToolCallCallback } from "ai";
import type { SloppyMessage } from "@/lib/agent/types";
import type { ToolOutcome } from "@/lib/agent/tools/registry";
import { SloppyProvider, useSloppy } from "../sloppy-provider";

const state = vi.hoisted(() => ({
	messages: [] as SloppyMessage[],
	setMessages: vi.fn(),
	sendMessage: vi.fn(),
	stop: vi.fn(),
	addToolOutput: vi.fn(),
	runTool: vi.fn(),
	onToolCall: undefined as ChatOnToolCallCallback<SloppyMessage> | undefined,
}));

vi.mock("@ai-sdk/react", () => ({
	useChat: (options: { onToolCall: typeof state.onToolCall }) => {
		state.onToolCall = options.onToolCall;
		return {
			messages: state.messages,
			setMessages: state.setMessages,
			sendMessage: state.sendMessage,
			stop: state.stop,
			addToolOutput: state.addToolOutput,
			status: "streaming",
		};
	},
}));

vi.mock("@/lib/project/project-provider", () => ({
	useProjectId: () => "project-1",
	useInitialTranscript: () => [],
}));

vi.mock("@/lib/agent/tools/use-agent-tools", () => ({
	useAgentTools: () => state.runTool,
}));

vi.mock("@/lib/connectors/use-default-models", () => ({
	useDefaultModels: () => ({ llm: { provider: "openai", model: "test" } }),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const asked: SloppyMessage = {
	id: "m1",
	role: "user",
	parts: [{ type: "text", text: "make it shorter" }],
};

const pending: SloppyMessage = {
	id: "m2",
	role: "assistant",
	parts: [
		{
			type: "tool-read_script",
			toolCallId: "call-0",
			input: {},
			state: "input-available",
		},
	],
};

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
let control: ReturnType<typeof useSloppy> | undefined;

function Probe({
	onControl,
}: {
	onControl: (control: ReturnType<typeof useSloppy>) => void;
}) {
	onControl(useSloppy());
	return null;
}

beforeEach(() => {
	state.messages = [asked, pending];
	vi.clearAllMocks();
	root = createRoot(container);
	act(() => {
		root.render(
			<SloppyProvider>
				<Probe onControl={(next) => (control = next)} />
			</SloppyProvider>,
		);
	});
});

function current() {
	if (!control) throw new Error("SloppyProvider did not render");
	return control;
}

afterEach(() => {
	act(() => root.unmount());
	container.replaceChildren();
});

describe("SloppyProvider stop", () => {
	it("settles the pending tool call when the user stops the turn", () => {
		act(() => current().stop());

		expect(state.stop).toHaveBeenCalledTimes(1);
		expect(state.setMessages).toHaveBeenCalledTimes(1);

		const update = state.setMessages.mock.calls[0]?.[0];
		const settled: SloppyMessage[] = update([asked, pending]);

		expect(settled.at(-1)?.parts).toEqual([
			{
				type: "tool-read_script",
				toolCallId: "call-0",
				input: {},
				state: "output-error",
				errorText: "Stopped by you before the editor finished it",
			},
		]);
	});
});

describe("SloppyProvider tool calls", () => {
	const toolCall = {
		type: "tool-call",
		toolCallId: "call-0",
		toolName: "review_script",
		input: {},
	} as const;

	function runToolCall() {
		if (!state.onToolCall) throw new Error("useChat got no onToolCall");
		return state.onToolCall({ toolCall });
	}

	it("hands a finished tool's output back to the model", async () => {
		state.runTool.mockResolvedValueOnce({
			ok: true,
			output: "Tighten act two",
		});
		act(() => current().send("review it"));

		await runToolCall();

		expect(state.addToolOutput).toHaveBeenCalledWith({
			tool: "review_script",
			toolCallId: "call-0",
			output: "Tighten act two",
		});
	});

	it("aborts the running tool and drops its output when the user stops", async () => {
		const tool = Promise.withResolvers<ToolOutcome>();
		state.runTool.mockReturnValueOnce(tool.promise);
		act(() => current().send("review it"));

		const running = runToolCall();
		act(() => current().stop());
		tool.resolve({ ok: true, output: "Tighten act two" });
		await running;

		const signal: AbortSignal = state.runTool.mock.calls[0]?.[1];
		expect(signal.aborted).toBe(true);
		expect(state.addToolOutput).not.toHaveBeenCalled();
	});
});
