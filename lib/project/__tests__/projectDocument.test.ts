import { createEditor, type Editor } from "slate";
import { withHistory } from "slate-history";
import { describe, expect, it } from "vitest";
import type { SceneElement } from "@/lib/canvas/types";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ConnectorModels } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/video/elementAttributes";
import { createAccountStore } from "@/lib/user/accountStore";
import { createProjectDocument, type ProjectContent } from "../projectDocument";
import { createProjectStore } from "../store";
import { MetadataSchema } from "../types";

const RECOMMENDED_IMAGE = {
	provider: "openslop",
	model: "Slop Image v1",
} as const;
const BYOK_IMAGE = {
	provider: "runware",
	model: "Seedream 5 Lite",
} as const;

// A pre-BYOK serialization: a model name with no provider, so hasModel fails at
// parse and the element falls back to its resolved default-model scope.
const PRE_BYOK_IMAGE_SCRIPT = `<image model="Slop Image v1">a sunset</image>`;

const metadataWith = (models: ConnectorModels) =>
	MetadataSchema.parse({ models });

const contentWith = (
	script: string,
	models: ConnectorModels = {},
): ProjectContent => ({
	script,
	store: { metadata: metadataWith(models), referenceImages: [] },
	generation: {},
});

const accountStoreWith = (models: ConnectorModels) =>
	createAccountStore({ models, providerKeys: [] });

// only the two methods createProjectDocument touches in read/write
const fakeQueue = (): GenerationQueue =>
	({
		snapshot: () => ({}),
		replaceSnapshots: () => {},
	}) as unknown as GenerationQueue;

const firstImageAttrs = (editor: Editor) => {
	const scene = editor.children[0] as SceneElement;
	return flatAttributes(scene.children[0]);
};

const setup = (accountModels: ConnectorModels = {}) => {
	const editor = withHistory(createEditor());
	const store = createProjectStore();
	const document = createProjectDocument({
		editor,
		store,
		queue: fakeQueue(),
		accountStore: accountStoreWith(accountModels),
	});
	return { editor, store, document };
};

describe("createProjectDocument.write (version preview/restore)", () => {
	it("resolves the account default when the version pins nothing and the element's pair is lost at parse", () => {
		const { editor, document } = setup({ image: BYOK_IMAGE });

		document.write(contentWith(PRE_BYOK_IMAGE_SCRIPT));

		// Before the fix, write passed only the (empty) project pins and skipped
		// the account scope, so the fallback resolved to DEFAULT_MODELS.image.
		expect(firstImageAttrs(editor)).toMatchObject(BYOK_IMAGE);
		expect(firstImageAttrs(editor).provider).not.toBe(
			RECOMMENDED_IMAGE.provider,
		);
	});

	it("uses the version's project pins, not the live project's, when resolving the fallback", () => {
		const { editor, store, document } = setup();
		// The live project pins the recommended model; the version pins the BYOK
		// one. Before the fix, write read store.getState().metadata.models (the
		// live project's pins, since applyScriptToEditor ran before the snapshot
		// was replaced) and resolved the fallback to the recommendation.
		store.getState().updateMetadata({ models: { image: RECOMMENDED_IMAGE } });

		const content = contentWith(PRE_BYOK_IMAGE_SCRIPT, { image: BYOK_IMAGE });
		document.write(content);

		expect(firstImageAttrs(editor)).toMatchObject(BYOK_IMAGE);
		expect(firstImageAttrs(editor).provider).not.toBe(
			RECOMMENDED_IMAGE.provider,
		);
		// the live store is replaced with the version's snapshot after the apply
		expect(store.getState().metadata.models).toEqual(
			content.store.metadata.models,
		);
	});

	it("keeps an element's own valid pair over the account default (no happy-path regression)", () => {
		const { editor, document } = setup({ image: BYOK_IMAGE });

		document.write(
			contentWith(
				`<image provider="openslop" model="Slop Image v1">a sunset</image>`,
			),
		);

		// hasModel passes, so the element's own pair wins regardless of scope.
		expect(firstImageAttrs(editor)).toMatchObject(RECOMMENDED_IMAGE);
	});

	it("reads back the live script and store snapshot after a write", () => {
		const { document } = setup({ image: BYOK_IMAGE });

		const content = contentWith(PRE_BYOK_IMAGE_SCRIPT, { image: BYOK_IMAGE });
		document.write(content);

		const read = document.read();
		expect(read.script).toContain("<image");
		expect(read.store.metadata.models).toEqual(content.store.metadata.models);
	});
});
