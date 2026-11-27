// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useFileUpload } from "../use-file-upload";

const { uploadFile, landings } = vi.hoisted(() => {
	const landings: (() => void)[] = [];
	const uploadFile = vi.fn(
		(_kind: string, file: File) =>
			new Promise<string>((resolve) =>
				landings.push(() => resolve(`https://blob/${file.name}`)),
			),
	);
	return { uploadFile, landings };
});
vi.mock("../upload-file", () => ({ uploadFile }));

const onUpload = vi.fn();
const container = document.body.appendChild(document.createElement("div"));
let root: Root;

function Probe() {
	const { inputElement, uploading } = useFileUpload({
		kinds: ["image", "video", "audio"],
		multiple: true,
		onUpload,
	});
	return (
		<>
			{inputElement}
			<output>{uploading.map((file) => file.kind).join(",")}</output>
		</>
	);
}

beforeEach(() => {
	landings.length = 0;
	root = createRoot(container);
	act(() => root.render(<Probe />));
});

afterEach(() => {
	act(() => root.unmount());
});

const uploading = () => container.querySelector("output")?.textContent;

async function choose(...files: File[]) {
	const input = container.querySelector("input");
	if (!input) throw new Error("no file input rendered");
	Object.defineProperty(input, "files", { value: files, configurable: true });
	await act(async () =>
		input.dispatchEvent(new Event("change", { bubbles: true })),
	);
}

it("names the kind of each file still uploading until it lands", async () => {
	await choose(
		new File(["a"], "theme.wav", { type: "audio/wav" }),
		new File(["i"], "pic.png", { type: "image/png" }),
	);

	expect(uploading()).toBe("audio,image");

	await act(async () => landings.forEach((land) => land()));

	expect(uploading()).toBe("");
	expect(onUpload).toHaveBeenCalledWith([
		{ kind: "audio", name: "theme.wav", url: "https://blob/theme.wav" },
		{ kind: "image", name: "pic.png", url: "https://blob/pic.png" },
	]);
});
