// @vitest-environment happy-dom

import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Editor, Transforms } from "slate";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { element, makeEditor } from "@/lib/canvas/__tests__/_assets";
import { createProjectStore } from "@/lib/project/store";
import { EMPTY_SNAPSHOT } from "@/lib/generation/snapshots";
import { useAgentTools } from "../tools/use-agent-tools";

let editor: Editor;
const store = createProjectStore();

vi.mock("slate-react", () => ({ useSlateStatic: () => editor }));
vi.mock("@/lib/project/project-store-provider", () => ({
	useProjectStoreHandle: () => store,
}));
vi.mock("@/lib/user/account-store-provider", () => ({
	useAccountStoreHandle: () => ({ getState: () => ({ models: {} }) }),
}));
vi.mock("@/lib/project/project-provider", () => ({
	useProjectId: () => "project-1",
}));
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => ({ getElementSnapshot: () => EMPTY_SNAPSHOT }),
}));
vi.mock("@/lib/generation/use-build-context", () => ({
	useBuildContext: () => () => ({ canvas: [] }),
}));
vi.mock("@/lib/connectors/use-create-connector", () => ({
	useCreateConnector: () => () => ({
		generate: async () => ({ text: "No findings." }),
	}),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
let runTool: ReturnType<typeof useAgentTools>;

function Probe() {
	const tools = useAgentTools();
	useEffect(() => {
		runTool = tools;
	}, [tools]);
	return null;
}

const read = () => runTool({ toolName: "read_script", input: {} });
const edit = (text: string) =>
	runTool({
		toolName: "edit_script",
		input: { ops: [{ op: "set", id: "line", text }] },
	});
const text = () => Editor.string(editor, [0, 1]).replaceAll("\u200b", "");

beforeEach(() => {
	editor = makeEditor([
		{
			type: "scene",
			id: "scene-1",
			children: [
				element("video", "video", "A cat", { duration: "15" }),
				element("line", "speech", "The cat is on the mat."),
			],
		},
	]);
	root = createRoot(container);
	act(() => root.render(<Probe />));
});

afterEach(() => {
	act(() => root.unmount());
	container.replaceChildren();
});

describe("edit_script read guard", () => {
	it("refuses an edit before the first read, including after a remount", async () => {
		expect(await edit("Replacement")).toMatchObject({
			ok: false,
			errorText: expect.stringContaining("Call read_script before editing"),
		});
		expect(text()).toBe("The cat is on the mat.");
		await read();
		act(() => root.render(null));
		act(() => root.render(<Probe />));
		expect((await edit("Replacement")).ok).toBe(false);
	});

	it("protects a user's mid-turn edit until the canvas is read again", async () => {
		await read();
		Transforms.insertText(editor, "Hand edited. ", {
			at: { path: [0, 1, 0], offset: 0 },
		});
		act(() => root.render(<Probe />));

		expect(await edit("Overwritten")).toMatchObject({ ok: false });
		expect(text()).toBe("Hand edited. The cat is on the mat.");
		await read();
		expect((await edit("Read and revised")).ok).toBe(true);
		expect(text()).toBe("Read and revised");
	});

	it("allows consecutive agent edits across renders and selection changes", async () => {
		await read();
		expect((await edit("First revision")).ok).toBe(true);
		act(() => root.render(<Probe />));
		Transforms.select(editor, Editor.start(editor, [0, 1]));
		expect((await edit("Second revision")).ok).toBe(true);
		expect(text()).toBe("Second revision");
	});

	it.each([false, true])(
		"lets fit_durations compute live without refreshing the edit read (read first: %s)",
		async (readFirst) => {
			if (readFirst) await read();
			const fitted = await runTool({ toolName: "fit_durations", input: {} });

			expect(fitted).toMatchObject({
				ok: true,
				output: expect.stringContaining("Fitted 1 of 1"),
			});
			expect((await edit("Replacement")).ok).toBe(false);
		},
	);

	it("requires a new read after a partially failed edit", async () => {
		await read();
		await runTool({
			toolName: "edit_script",
			input: {
				ops: [
					{ op: "set", id: "line", text: "Applied part" },
					{ op: "remove", id: "missing" },
				],
			},
		});

		expect(text()).toBe("Applied part");
		expect((await edit("Retry")).ok).toBe(false);
		await read();
		expect((await edit("Retry")).ok).toBe(true);
	});

	it("does not count a review's private read as a read_script", async () => {
		expect((await runTool({ toolName: "review_script", input: {} })).ok).toBe(
			true,
		);
		expect((await edit("Unseen replacement")).ok).toBe(false);
	});
});
