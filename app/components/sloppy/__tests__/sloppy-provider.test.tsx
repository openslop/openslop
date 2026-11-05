// @vitest-environment happy-dom

import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SloppyMessage } from "@/lib/agent/types";
import { SloppyProvider, useSloppy } from "../sloppy-provider";

const state = vi.hoisted(() => ({
	messages: [] as SloppyMessage[],
	setMessages: vi.fn(),
	sendMessage: vi.fn(),
	stop: vi.fn(),
	addToolOutput: vi.fn(),
}));

vi.mock("@ai-sdk/react", () => ({
	useChat: () => ({
		messages: state.messages,
		setMessages: state.setMessages,
		sendMessage: state.sendMessage,
		stop: state.stop,
		addToolOutput: state.addToolOutput,
		status: "streaming",
	}),
}));

vi.mock("@/lib/project/project-provider", () => ({
	useProjectId: () => "project-1",
	useInitialTranscript: () => [],
}));

vi.mock("@/lib/agent/tools/use-agent-tools", () => ({
	useAgentTools: () => vi.fn(),
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
	const current = useSloppy();
	useEffect(() => {
		onControl(current);
	});
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
