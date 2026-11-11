import { describe, expect, it } from "vitest";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import type { ContentElement, Scene } from "@/lib/canvas/types";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { usesFor } from "../media-uses";

const scene = (id: string, ...children: ContentElement[]): Scene => ({
	id,
	type: "scene",
	children,
});

const nodes = [
	asset("asset_avatar", { name: "Mia" }),
	asset("asset_voice", { name: "Narrator" }),
	scene("s1", createCanvasElement("image", { id: "i1" })),
	scene("s2", createCanvasElement("video", { id: "v1" })),
];

const targetsOf = (kind: "image" | "video" | "audio") =>
	Object.fromEntries(
		usesFor(kind).map((use) => [
			use.label,
			use.targets(nodes, kind).map(({ label }) => label),
		]),
	);

describe("usesFor", () => {
	it("offers a picture to avatars, matching visuals, start frames and references", () => {
		expect(targetsOf("image")).toEqual({
			"Character avatar": ["Mia"],
			"Scene visual": ["Scene 1"],
			"Start frame": ["Scene 2"],
			"Reference image": ["Scene 1", "Scene 2"],
		});
	});

	it("offers a video only to the video visuals", () => {
		expect(targetsOf("video")).toEqual({ "Scene visual": ["Scene 2"] });
	});

	it("offers audio nowhere", () => {
		expect(usesFor("audio")).toEqual([]);
	});
});
