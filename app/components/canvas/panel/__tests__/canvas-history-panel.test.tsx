// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Autosaver } from "@/lib/project/autosave";
import {
	CanvasHistory,
	type CanvasVersionStorage,
} from "@/lib/project/canvas-history";
import { CanvasHistoryProvider } from "@/lib/project/canvas-history-provider";
import type { ProjectDocument } from "@/lib/project/project-document";
import type { SavedProject } from "@/lib/project/saved-project";
import { ProjectDataSchema } from "@/lib/project/store";
import { CanvasHistoryPanel } from "../canvas-history-panel";

vi.mock("@/app/components/user-avatar", () => ({ UserAvatar: () => null }));
vi.mock("@/lib/user/user-provider", () => ({ useUser: () => null }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const content = (script: string): SavedProject => ({
	script,
	store: ProjectDataSchema.parse({}),
	generation: {},
});

/** Three saved versions, newest first; the canvas holds edits not saved yet. */
function setUp() {
	const storage: CanvasVersionStorage = {
		list: () =>
			Promise.resolve(
				["v3", "v2", "v1"].map((id) => ({ id, updatedAt: "2026-11-01" })),
			),
		read: (id) => Promise.resolve(content(id)),
		create: () => Promise.reject(new Error("not saved in this test")),
		update: () => Promise.reject(new Error("not saved in this test")),
	};
	let live = content("unsaved edits");
	const document: ProjectDocument = {
		read: () => live,
		write: (next) => {
			live = next;
		},
		meta: () => ({ name: "Untitled", thumbnail_url: null }),
	};
	const autosaver: Autosaver = {
		schedule: vi.fn(),
		flush: vi.fn(),
		suspend: vi.fn(),
		resume: vi.fn(),
		onProjectSaved: vi.fn(() => () => {}),
	};
	return {
		history: new CanvasHistory(storage, document, autosaver),
		onCanvas: () => live.script,
	};
}

let root: Root;
let container: HTMLElement;

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

async function open(history: CanvasHistory) {
	container = document.body.appendChild(document.createElement("div"));
	root = createRoot(container);
	await act(async () =>
		root.render(
			<CanvasHistoryProvider history={history}>
				<CanvasHistoryPanel />
			</CanvasHistoryProvider>,
		),
	);
}

const rows = () => Array.from(container.querySelectorAll("li"));
const buttons = (row: number) =>
	Array.from(rows()[row]?.querySelectorAll("button") ?? []).map(
		(button) => button.textContent,
	);
const press = (row: number, label: string) =>
	act(async () => {
		const button = Array.from(
			rows()[row]?.querySelectorAll("button") ?? [],
		).find((each) => each.textContent === label);
		if (!button) throw new Error(`row ${row} has no ${label}`);
		button.click();
	});

describe("CanvasHistoryPanel", () => {
	it("shows the newest version as current, with nothing to do", async () => {
		await open(setUp().history);
		expect(buttons(0)).toEqual([]);
		expect(buttons(1)).toEqual(["View"]);
		expect(buttons(2)).toEqual(["View"]);
	});

	it("offers the newest version while an older one is previewed", async () => {
		const { history, onCanvas } = setUp();
		await open(history);
		await press(2, "View");
		expect(onCanvas()).toBe("v1");
		expect(buttons(0)).toEqual(["View"]);
		expect(buttons(1)).toEqual(["View"]);
		expect(buttons(2)).toEqual(["Restore"]);
	});

	it("returns to latest from the newest row, unsaved edits included", async () => {
		const { history, onCanvas } = setUp();
		await open(history);
		await press(1, "View");
		await press(0, "View");
		expect(onCanvas()).toBe("unsaved edits");
		expect(history.getState().previewId).toBeNull();
		expect(rows().map((_, row) => buttons(row))).toEqual([
			[],
			["View"],
			["View"],
		]);
	});

	it("reveals the newest row's View on hover and focus, like the others", async () => {
		const { history } = setUp();
		await open(history);
		await press(2, "View");
		const view = (row: number) =>
			rows()[row]?.querySelector("button")?.className;
		expect(view(0)).toBe(view(1));
		expect(view(0)).toContain("group-focus-within:opacity-100");
	});
});
