// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { deleteProject, type ProjectRow } from "@/lib/project/api";
import { toastError } from "@/lib/toast-error";
import { click } from "@/app/components/canvas/__tests__/_mount";
import ProjectsList from "../projects-list";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/lib/project/api", () => ({
	createProject: vi.fn(),
	deleteProject: vi.fn(),
}));
vi.mock("@/lib/toast-error", () => ({ toastError: vi.fn() }));
vi.mock("@/app/components/user-profile", () => ({ default: () => null }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const project = (name: string): ProjectRow => ({
	id: `id-${name}`,
	name,
	thumbnail_url: null,
	updated_at: "2026-10-16T00:00:00.000Z",
});

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
	act(() =>
		root.render(
			<ProjectsList initialProjects={[project("A"), project("B")]} />,
		),
	);
});

afterEach(() => {
	act(() => root.unmount());
});

const cardNames = () =>
	Array.from(container.querySelectorAll("li a[aria-label^='Open ']")).map(
		(link) => link.getAttribute("aria-label")?.replace("Open ", ""),
	);

const confirmDelete = async (name: string) => {
	await click(`[aria-label="Delete ${name}"]`);
	await act(async () => {
		Array.from(
			document.querySelectorAll<HTMLButtonElement>("[role=alertdialog] button"),
		)
			.findLast((button) => button.textContent === "Delete project")
			?.click();
	});
};

const pendingDelete = () => {
	const request = Promise.withResolvers<void>();
	vi.mocked(deleteProject).mockReturnValueOnce(request.promise);
	return request;
};

const settle = () => act(async () => {});

describe("ProjectsList delete", () => {
	it("hides the card while the delete is in flight and keeps it gone on success", async () => {
		const request = pendingDelete();

		await confirmDelete("A");
		expect(cardNames()).toEqual(["B"]);
		expect(container.textContent).toContain("1 project");

		request.resolve();
		await settle();
		expect(cardNames()).toEqual(["B"]);
		expect(toastError).not.toHaveBeenCalled();
	});

	it("brings the card back with a toast when the delete fails", async () => {
		const request = pendingDelete();

		await confirmDelete("A");
		request.reject(new Error("row is locked"));
		await settle();

		expect(cardNames()).toEqual(["A", "B"]);
		expect(toastError).toHaveBeenCalledExactlyOnceWith(
			expect.any(Error),
			"Could not delete project",
		);
	});

	it("restores only the failed delete when two overlap", async () => {
		const first = pendingDelete();
		const second = pendingDelete();

		await confirmDelete("A");
		await confirmDelete("B");
		expect(cardNames()).toEqual([]);

		second.resolve();
		first.reject(new Error("row is locked"));
		await settle();

		expect(cardNames()).toEqual(["A"]);
	});
});
