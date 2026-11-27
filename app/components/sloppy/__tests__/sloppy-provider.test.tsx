// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	ChatOnFinishCallback,
	ChatOnToolCallCallback,
	ChatTransport,
} from "ai";
import { DEPLOYMENT_HEADER } from "@/lib/deployment/deployment-id";
import type { SloppyMessage } from "@/lib/agent/types";
import type { ToolOutcome } from "@/lib/agent/tools/registry";
import { SloppyProvider, useSloppy } from "../sloppy-provider";

const state = vi.hoisted(() => ({
	messages: [] as SloppyMessage[],
	status: "streaming",
	setMessages: vi.fn(),
	sendMessage: vi.fn(),
	stop: vi.fn(),
	addToolOutput: vi.fn(),
	runTool: vi.fn(),
	onToolCall: undefined as ChatOnToolCallCallback<SloppyMessage> | undefined,
	onFinish: undefined as ChatOnFinishCallback<SloppyMessage> | undefined,
	transport: undefined as ChatTransport<SloppyMessage> | undefined,
}));

vi.mock("@ai-sdk/react", () => ({
	useChat: (options: {
		onToolCall: typeof state.onToolCall;
		onFinish: typeof state.onFinish;
		transport: typeof state.transport;
	}) => {
		state.onToolCall = options.onToolCall;
		state.onFinish = options.onFinish;
		state.transport = options.transport;
		return {
			messages: state.messages,
			setMessages: state.setMessages,
			sendMessage: state.sendMessage,
			stop: state.stop,
			addToolOutput: state.addToolOutput,
			status: state.status,
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

vi.mock("slate-react", () => ({ useSlateStatic: () => ({}) }));

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
	state.status = "streaming";
	vi.clearAllMocks();
	root = createRoot(container);
	render();
});

function render() {
	act(() => {
		root.render(
			<SloppyProvider>
				<Probe onControl={(next) => (control = next)} />
			</SloppyProvider>,
		);
	});
}

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
		toolName: "read_script",
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

		await vi.waitFor(() =>
			expect(state.addToolOutput).toHaveBeenCalledWith({
				tool: "read_script",
				toolCallId: "call-0",
				output: "Tighten act two",
			}),
		);
	});

	it("drops a running tool's output when the user stops", async () => {
		const tool = Promise.withResolvers<ToolOutcome>();
		state.runTool.mockReturnValueOnce(tool.promise);
		act(() => current().send("review it"));

		await runToolCall();
		act(() => current().stop());
		tool.resolve({ ok: true, output: "Tighten act two" });
		await tool.promise;

		expect(state.addToolOutput).not.toHaveBeenCalled();
	});
});

describe("SloppyProvider loading", () => {
	const answered: SloppyMessage = {
		...pending,
		parts: [
			{
				type: "tool-read_script",
				toolCallId: "call-0",
				input: {},
				state: "output-available",
				output: "the script",
			},
		],
	};

	const finish = (finishReason: "tool-calls" | "stop") =>
		act(() =>
			state.onFinish?.({
				message: answered,
				messages: [asked, answered],
				isAbort: false,
				isDisconnect: false,
				isError: false,
				finishReason,
			}),
		);

	beforeEach(() => {
		state.messages = [asked, answered];
		state.status = "ready";
		render();
		act(() => current().send("make it shorter"));
	});

	it("keeps working between steps, once every call is answered and before the next is sent", () => {
		finish("tool-calls");

		expect(current().loading).toBe(true);
	});

	it("stops working once a step ends without asking for more calls", () => {
		finish("stop");

		expect(current().loading).toBe(false);
	});

	it("stops working when the user stops the turn", () => {
		act(() => current().stop());

		expect(current().loading).toBe(false);
	});
});

describe("SloppyProvider requests", () => {
	const sentHeaders = async () => {
		const fetch = vi.fn(async () => new Response(new ReadableStream()));
		vi.stubGlobal("fetch", fetch);
		await state.transport?.sendMessages({
			chatId: "chat-1",
			messages: [asked],
			abortSignal: undefined,
			trigger: "submit-message",
			messageId: undefined,
		});
		const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
		return new Headers(init.headers);
	};

	afterEach(() => {
		delete document.documentElement.dataset.dplId;
		vi.unstubAllGlobals();
	});

	it("names the page's deployment, so the agent route can refuse a stale tab", async () => {
		document.documentElement.dataset.dplId = "dpl-1";

		expect((await sentHeaders()).get(DEPLOYMENT_HEADER)).toBe("dpl-1");
	});

	it("names none when the page has no deployment (local dev)", async () => {
		expect((await sentHeaders()).has(DEPLOYMENT_HEADER)).toBe(false);
	});
});
