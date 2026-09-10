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

const RECOMMENDED = { provider: "openslop", model: "Slop Image v1" } as const;
const BYOK = { provider: "runware", model: "Seedream 5 Lite" } as const;

// No provider, so the pair fails to parse and the element takes the default.
const UNPINNED = `<image model="Slop Image v1">a sunset</image>`;
const PINNED = `<image provider="openslop" model="Slop Image v1">a sunset</image>`;

const contentWith = (
	script: string,
	models: ConnectorModels = {},
): ProjectContent => ({
	script,
	store: { metadata: MetadataSchema.parse({ models }), referenceImages: [] },
	generation: {},
});

const imageAttrs = (editor: Editor, index: number) =>
	flatAttributes((editor.children[0] as SceneElement).children[index]);

const setup = (accountModels: ConnectorModels = {}) => {
	const editor = withHistory(createEditor());
	const store = createProjectStore();
	const document = createProjectDocument({
		editor,
		store,
		queue: {
			snapshot: () => ({}),
			replaceSnapshots: () => {},
		} as unknown as GenerationQueue,
		accountStore: createAccountStore({
			models: accountModels,
			providerKeys: [],
		}),
	});
	return { editor, store, document };
};

describe("createProjectDocument.write", () => {
	it("falls back to the account default, keeping an element's own pair", () => {
		const { editor, document } = setup({ image: BYOK });

		document.write(contentWith(`${UNPINNED}${PINNED}`));

		expect(imageAttrs(editor, 0)).toMatchObject(BYOK);
		expect(imageAttrs(editor, 1)).toMatchObject(RECOMMENDED);
	});

	it("resolves against the version's pins, not the live project's", () => {
		const { editor, store, document } = setup();
		store.getState().updateMetadata({ models: { image: RECOMMENDED } });

		const content = contentWith(UNPINNED, { image: BYOK });
		document.write(content);

		expect(imageAttrs(editor, 0)).toMatchObject(BYOK);
		expect(store.getState().metadata.models).toEqual(
			content.store.metadata.models,
		);
	});
});
