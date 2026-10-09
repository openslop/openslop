import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAsset, NARRATOR } from "@/lib/canvas/assets";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import type { CanvasElement } from "@/lib/canvas/types";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import type {
	AssetResult,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import type { BuildContext } from "../graph";
import { buildNode, generatedById } from "../generationGraph";
import { GenerationQueue } from "../queue";
import { isNodeStale } from "../staleness";
import { buildCtx } from "./_context";

const mediaGenerate =
	vi.fn<(params: object, context: PluginContext) => Promise<AssetResult>>();
vi.mock("@/lib/connectors/factory", async (original) => ({
	...(await original<typeof import("@/lib/connectors/factory")>()),
	createConnector: () => ({ generate: mediaGenerate }),
}));

let canvas: CanvasElement[];
let registry: ConnectorRegistry;

const context = (): BuildContext =>
	buildCtx(canvas, {
		registry,
		setAsset: ({ type, name, attrs }) => {
			canvas = [...canvas, asset(type, { name, attrs })];
		},
	});

const byId = (id: string) => {
	const found = generatedById(canvas, id);
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
			createCanvasElement("asset_style", { text: "noir" }),
			createCanvasElement("asset_avatar", {
				attrs: { name: "Red" },
				text: "red hood",
			}),
			createCanvasElement("image", {
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
			asset("asset_avatar", { name: "Red", text: "red hood" }),
			createCanvasElement("image", {
				id: "img",
				attrs: { characters: "Red" },
				text: "a lighthouse",
			}),
		];
		const queue = new GenerationQueue();
		const avatar = nodeOf(canvas[0].id);
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
			reads: [
				(_, { canvas }) => ({
					voice:
						findAsset(canvas, "asset_voice", NARRATOR)?.generationAttributes
							?.voiceId ?? "",
				}),
			],
			prepare: async (_, { setAsset }) =>
				setAsset({
					type: "asset_voice",
					name: NARRATOR,
					attrs: { voiceId: "v-7" },
				}),
		};

		beforeEach(() => {
			registry = {
				...DEFAULT_CONNECTOR_REGISTRY,
				image: { plugins: [settleVoice] },
			};
			canvas = [
				createCanvasElement("image", { id: "img", text: "a lighthouse" }),
			];
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
				findAsset(canvas, "asset_voice", NARRATOR)?.generationAttributes
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
