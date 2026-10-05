import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAsset, NARRATOR } from "@/lib/canvas/assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { assetId, type ScriptElement } from "@/lib/canvas/types";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import type {
	AssetResult,
	ConnectorPlugin,
	GenerationContext,
} from "@/lib/connectors/types";
import { createProjectStore } from "@/lib/project/store";
import type { BuildContext } from "../graph";
import { buildNode } from "../generationGraph";
import { GenerationQueue } from "../queue";
import { isNodeStale } from "../staleness";

const mediaGenerate =
	vi.fn<(params: object, context: GenerationContext) => Promise<AssetResult>>();
vi.mock("@/lib/connectors/factory", async (original) => ({
	...(await original<typeof import("@/lib/connectors/factory")>()),
	createConnector: () => ({ generate: mediaGenerate }),
}));

let canvas: ScriptElement[];
let registry: ConnectorRegistry;

const context = (): BuildContext => ({
	state: createProjectStore().getState(),
	canvas,
	registry,
	setAsset: ({ type, name, attrs }) => {
		canvas = [
			...canvas,
			createCanvasNode(type, { attrs: name ? { name, ...attrs } : attrs }),
		];
	},
});

const byId = (id: string) => {
	const found = canvas.find((element) => element.id === id);
	if (!found) throw new Error(`no element ${id}`);
	return found;
};

const nodeOf = (id: string) => buildNode(byId(id), context());

beforeEach(() => {
	mediaGenerate.mockReset();
	registry = DEFAULT_CONNECTOR_REGISTRY;
});

describe("running a graph", () => {
	it("runs the avatar an image shows first, and hands the image what it read off the canvas", async () => {
		canvas = [
			createCanvasNode("style", { text: "noir" }),
			createCanvasNode("cast", { attrs: { name: "Red" }, text: "red hood" }),
			createCanvasNode("image", {
				id: "img",
				attrs: { characters: "Red" },
				text: "a lighthouse",
			}),
		];
		const queue = new GenerationQueue();
		mediaGenerate.mockImplementation(async ({ prompt }: { prompt?: string }) =>
			prompt === "red hood"
				? { imageUrl: "red.png", durationSec: 0 }
				: { imageUrl: "img.png", durationSec: 0 },
		);

		queue.enqueueGraph([nodeOf("img")], context);

		await vi.waitFor(() =>
			expect(queue.getElementSnapshot("img").result).toBeTruthy(),
		);
		expect(mediaGenerate).toHaveBeenCalledTimes(2);
		const [, imageContext] = mediaGenerate.mock.calls[1] ?? [];
		expect(imageContext?.dependencies?.["avatar:Red"]?.imageUrl).toBe(
			"red.png",
		);
		expect(imageContext?.reads?.["the art style"]).toBe("noir");
		expect(isNodeStale(nodeOf("img"), queue)).toBe(false);
	});

	it("records the avatar an image was sent, so one replaced mid-flight leaves the image stale", async () => {
		canvas = [
			createCanvasNode("cast", {
				id: assetId("cast", "Red"),
				attrs: { name: "Red" },
				text: "red hood",
			}),
			createCanvasNode("image", {
				id: "img",
				attrs: { characters: "Red" },
				text: "a lighthouse",
			}),
		];
		const queue = new GenerationQueue();
		const avatar = nodeOf(assetId("cast", "Red"));
		queue.commitResult(avatar, { imageUrl: "red.png", durationSec: 0 });
		let finish = (_: AssetResult) => {};
		mediaGenerate.mockImplementation(
			() => new Promise((resolve) => (finish = resolve)),
		);

		queue.enqueueGraph([nodeOf("img")], context);
		await vi.waitFor(() => expect(mediaGenerate).toHaveBeenCalledOnce());
		queue.commitResult(avatar, { imageUrl: "red-2.png", durationSec: 0 });
		finish({ imageUrl: "img.png", durationSec: 0 });

		await vi.waitFor(() =>
			expect(queue.getElementSnapshot("img").result).toBeTruthy(),
		);
		expect(isNodeStale(nodeOf("img"), queue)).toBe(true);
	});

	describe("the prepare step", () => {
		const settleVoice: ConnectorPlugin = {
			name: "voice",
			reads: (_, ctx) => ({
				voice:
					findAsset(ctx.canvas, "cast", NARRATOR)?.generationAttributes
						?.voiceId ?? "",
			}),
			prepare: async () => [
				{ type: "cast", name: NARRATOR, attrs: { voiceId: "v-7" } },
			],
		};

		beforeEach(() => {
			registry = {
				...DEFAULT_CONNECTOR_REGISTRY,
				image: { plugins: [settleVoice] },
			};
			canvas = [createCanvasNode("image", { id: "img", text: "a lighthouse" })];
			mediaGenerate.mockResolvedValue({ imageUrl: "img.png", durationSec: 0 });
		});

		it("writes the asset it settles, generates reading it, and records it so the result stays current", async () => {
			const queue = new GenerationQueue();
			const before = nodeOf("img");

			queue.enqueueGraph([before], context);
			await vi.waitFor(() =>
				expect(queue.getElementSnapshot("img").result).toBeTruthy(),
			);

			expect(
				byId(assetId("cast", NARRATOR)).generationAttributes?.voiceId,
			).toBe("v-7");
			expect(mediaGenerate.mock.calls[0]?.[1].reads?.voice).toBe("v-7");
			expect(queue.getElementSnapshot("img").resultInputs?.reads.voice).toBe(
				"v-7",
			);
			expect(isNodeStale(nodeOf("img"), queue)).toBe(false);
			expect(isNodeStale(before, queue)).toBe(true);
		});
	});
});
