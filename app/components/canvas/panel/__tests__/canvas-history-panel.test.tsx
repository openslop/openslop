// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
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

let generating = false;
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useQueueSelector: (select: (q: unknown) => unknown) =>
		select({ isBusy: () => generating }),
}));

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
	generating = false;
	act(() => root.unmount());
	container.remove();
});

async function open(history: CanvasHistory) {
	container = document.body.appendChild(document.createElement("div"));
	root = createRoot(container);
	await act(async () =>
		root.render(
			<TooltipProvider>
				<CanvasHistoryProvider history={history}>
					<CanvasHistoryPanel />
				</CanvasHistoryProvider>
			</TooltipProvider>,
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
	it("offers View on every version while nothing is previewed", async () => {
		await open(setUp().history);
		expect(rows().map((_, row) => buttons(row))).toEqual([
			["View"],
			["View"],
			["View"],
		]);
	});

	it("previews the newest version like any other", async () => {
		const { history, onCanvas } = setUp();
		await open(history);
		await press(0, "View");
		expect(onCanvas()).toBe("v3");
		expect(history.getState().previewId).toBe("v3");
	});

	it("offers Restore on the previewed version only", async () => {
		const { history } = setUp();
		await open(history);
		await press(2, "View");
		expect(rows().map((_, row) => buttons(row))).toEqual([
			["View"],
			["View"],
			["Restore"],
		]);
	});

	it("holds View while a generation runs, since a preview would abort it", async () => {
		generating = true;
		const { history, onCanvas } = setUp();
		await open(history);
		await press(0, "View");
		expect(onCanvas()).toBe("unsaved edits");
		expect(history.getState().previewId).toBeNull();
	});
});
