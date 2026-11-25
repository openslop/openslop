// @vitest-environment happy-dom

import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Transforms, type Editor } from "slate";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { element, makeEditor } from "@/lib/canvas/__tests__/_assets";
import { requireElement } from "@/lib/canvas/editor-ops";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
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
const edit = (text: string, id = "line") =>
	runTool({
		toolName: "edit_script",
		input: { ops: [{ op: "set", id, text }] },
	});
const bodyText = (id = "line") =>
	getElementBodyText(requireElement(editor, id)[0]);

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
	it("edits the canvas as last read", async () => {
		await read();

		expect((await edit("Revised")).ok).toBe(true);
		expect(bodyText()).toBe("Revised");
	});

	it("names what it inserts, so it can edit that next without reading", async () => {
		await read();
		const inserted = await runTool({
			toolName: "edit_script",
			input: {
				ops: [
					{
						op: "insert",
						anchor_id: "line",
						elements: [{ type: "speech", text: "A dog barks." }],
					},
				],
			},
		});
		const id = String(inserted.ok && inserted.output).match(
			/Inserted (\S+?),/,
		)?.[1];

		expect(id).toBeDefined();
		expect((await edit("A dog howls.", String(id))).ok).toBe(true);
		expect(bodyText(String(id))).toBe("A dog howls.");
	});

	it("refuses an edit before any read", async () => {
		expect(await edit("Unseen")).toMatchObject({
			ok: false,
			errorText: expect.stringContaining("modified since read"),
		});
		expect(bodyText()).toBe("The cat is on the mat.");
	});

	it("refuses an edit after the user changes the canvas", async () => {
		await read();
		Transforms.insertText(editor, "Hand edited. ", {
			at: { path: [0, 1, 0], offset: 0 },
		});

		expect((await edit("Overwritten")).ok).toBe(false);
		expect(bodyText()).toBe("Hand edited. The cat is on the mat.");
	});

	it("keeps its read current through its own edits", async () => {
		await read();
		await edit("First");

		expect((await edit("Second")).ok).toBe(true);
		expect(bodyText()).toBe("Second");
	});

	it("refuses an edit after the user changes what it edited", async () => {
		await read();
		await edit("First");
		Transforms.insertText(editor, "Hand edited. ", {
			at: { path: [0, 1, 0], offset: 0 },
		});

		expect((await edit("Overwritten")).ok).toBe(false);
	});
});
