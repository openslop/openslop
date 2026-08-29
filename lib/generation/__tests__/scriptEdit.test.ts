import { describe, expect, it } from "vitest";
import { createEditor, type Descendant } from "slate";
import {
	stillDependency,
	stillElementId,
} from "@/lib/connectors/animated_image/plugins/still-frame";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type { SceneElement } from "@/lib/canvas/types";
import { MetadataSchema } from "@/lib/project/types";
import { splitAttributes } from "@/lib/video/elementAttributes";
import { forElement, needsGeneration } from "../graph";
import { GenerationQueue } from "../queue";
import { nodeBuilder } from "../resolveGraph";
import { applyScriptEdit, type ScriptEditContext } from "../scriptEdit";

const ID = "n1";
const STILL_ID = stillElementId(ID);
const IMAGE_URL = "https://example.com/frame.png";

const state = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

const buildNode = nodeBuilder(DEFAULT_CONNECTOR_REGISTRY, state);

const image = {
	id: ID,
	type: "image" as const,
	...splitAttributes({ provider: "openslop" }),
	children: [{ id: "t", type: "image" as const, text: "a forest" }],
};

const context = ({ generated = true, pinned = false } = {}) => {
	const editor = createEditor();
	editor.children = [
		{ id: "s1", type: "scene", children: [image] } as unknown as Descendant,
	];
	const queue = new GenerationQueue();
	if (generated)
		queue.commitResult(
			buildNode(forElement(image)),
			{ imageUrl: IMAGE_URL, durationSec: 0 },
			{ pinned },
		);
	return {
		editor,
		queue,
		connectors: DEFAULT_CONNECTOR_REGISTRY,
		state,
	} satisfies ScriptEditContext;
};

const animate = (
	ctx: ScriptEditContext,
	deps: Record<string, string> = { still: ID },
) =>
	applyScriptEdit(ctx, [
		{
			op: "set",
			id: ID,
			type: "animated_image",
			attrs: { videoPrompt: "slow push-in" },
			deps,
		},
	]);

const animated = (ctx: ScriptEditContext) => {
	const [scene] = ctx.editor.children as SceneElement[];
	const [element] = scene.children;
	return element;
};

const stillResult = (ctx: ScriptEditContext) =>
	ctx.queue.getElementSnapshot(STILL_ID);

describe("applyScriptEdit", () => {
	it("seeds a dependency of the element the edit just made", () => {
		const ctx = context();

		expect(animate(ctx)).toEqual({ applied: 1, failures: [] });
		expect(stillResult(ctx).result?.imageUrl).toBe(IMAGE_URL);
	});

	it("leaves the seeded still off the work the animation still needs", () => {
		const ctx = context();
		animate(ctx);
		const node = buildNode(forElement(animated(ctx)));
		const still = stillDependency(node);

		expect(still && needsGeneration(still, ctx.queue)).toBe(false);
		expect(needsGeneration(node, ctx.queue)).toBe(true);
	});

	// An uploaded frame must stay supplied, or the next bit of drift regenerates
	// over the user's own image.
	it("keeps a supplied result supplied", () => {
		const ctx = context({ pinned: true });
		animate(ctx);

		expect(stillResult(ctx).pinned).toBe(true);
	});

	it("leaves the source result where it is", () => {
		const ctx = context();
		animate(ctx);

		expect(ctx.queue.getElementSnapshot(ID).result?.imageUrl).toBe(IMAGE_URL);
	});

	it("applies the edit even when the seed cannot be done", () => {
		const ctx = context({ generated: false });

		expect(animate(ctx)).toEqual({
			applied: 1,
			failures: [`deps: "${ID}" has generated nothing to seed "still"`],
		});
	});

	it("reports a dependency the element does not have", () => {
		const ctx = context();

		expect(animate(ctx, { poster: ID }).failures).toEqual([
			`deps: "${ID}" has no "poster" to seed`,
		]);
	});

	it("reports an edit against a missing element once", () => {
		const ctx = context();

		expect(
			applyScriptEdit(ctx, [{ op: "set", id: "gone", deps: { still: ID } }])
				.failures,
		).toEqual(['set: no element "gone"']);
	});

	it("seeds nothing for an edit that declared nothing", () => {
		const ctx = context();

		expect(
			applyScriptEdit(ctx, [{ op: "set", id: ID, text: "a meadow" }]),
		).toEqual({ applied: 1, failures: [] });
		expect(stillResult(ctx).result).toBeNull();
	});
});
