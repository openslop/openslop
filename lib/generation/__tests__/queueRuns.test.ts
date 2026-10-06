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
	PluginContext,
} from "@/lib/connectors/types";
import { createProjectStore } from "@/lib/project/store";
import type { BuildContext } from "../graph";
import { dependency } from "../dependency";
import { buildNode } from "../generationGraph";
import { GenerationQueue } from "../queue";
import { isNodeStale } from "../staleness";

const mediaGenerate =
	vi.fn<(params: object, context: PluginContext) => Promise<AssetResult>>();
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
			createCanvasNode("asset_style", { text: "noir" }),
			createCanvasNode("asset_character", {
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
		expect(imageContext?.dependencies?.["Red's avatar"]?.imageUrl).toBe(
			"red.png",
		);
		expect(imageContext?.reads?.["the art style"]).toBe("noir");
		expect(isNodeStale(nodeOf("img"), queue)).toBe(false);
	});

	it("records the avatar an image was sent, so one replaced mid-flight leaves the image stale", async () => {
		canvas = [
			createCanvasNode("asset_character", {
				id: assetId("asset_character", "Red"),
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
		const avatar = nodeOf(assetId("asset_character", "Red"));
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

	it("runs a dependency the prepare step brings in before the job that needs it", async () => {
		const pullsInWave: ConnectorPlugin = {
			name: "pulls-in-wave",
			prepare: async () => [
				{ type: "asset_character", name: NARRATOR, attrs: { voiceId: "v-7" } },
			],
			dependencies: dependency("the wave", (_, { canvas }) =>
				findAsset(canvas, "asset_character", NARRATOR)
					? canvas.find(({ id }) => id === "wave")
					: undefined,
			).dependencies,
		};
		registry = {
			...DEFAULT_CONNECTOR_REGISTRY,
			image: { plugins: [pullsInWave] },
		};
		canvas = [
			createCanvasNode("video", { id: "wave", text: "a wave" }),
			createCanvasNode("image", { id: "img", text: "a lighthouse" }),
		];
		const queue = new GenerationQueue();
		mediaGenerate.mockImplementation(async ({ prompt }: { prompt?: string }) =>
			prompt === "a wave"
				? { videoUrl: "wave.mp4", durationSec: 4 }
				: { imageUrl: "img.png", durationSec: 0 },
		);

		queue.enqueueGraph([nodeOf("img")], context);

		await vi.waitFor(() =>
			expect(queue.getElementSnapshot("img").result).toBeTruthy(),
		);
		expect(mediaGenerate.mock.calls.map(([params]) => params)).toMatchObject([
			{ prompt: "a wave" },
			{ prompt: "a lighthouse" },
		]);
		expect(mediaGenerate.mock.calls[1]?.[1].dependencies?.["the wave"]).toEqual(
			{
				videoUrl: "wave.mp4",
				durationSec: 4,
			},
		);
	});

	describe("the prepare step", () => {
		const settleVoice: ConnectorPlugin = {
			name: "voice",
			reads: (_, ctx) => ({
				voice:
					findAsset(ctx.canvas, "asset_character", NARRATOR)
						?.generationAttributes?.voiceId ?? "",
			}),
			prepare: async () => [
				{ type: "asset_character", name: NARRATOR, attrs: { voiceId: "v-7" } },
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
				byId(assetId("asset_character", NARRATOR)).generationAttributes
					?.voiceId,
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
