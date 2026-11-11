import type { Descendant, Editor } from "slate";
import { addElementReferences } from "@/lib/canvas/asset-ops";
import { getAvatars } from "@/lib/canvas/assets";
import { sceneLabel } from "@/lib/canvas/constants";
import { elementOffers } from "@/lib/canvas/element-connector";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { sceneVisuals } from "@/lib/canvas/scenes";
import {
	CONTENT_TYPES,
	type ContentElement,
	type GeneratedElement,
} from "@/lib/canvas/types";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/reference-images";
import {
	openingOn,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/start-frame";
import { buildNode } from "@/lib/generation/generation-graph";
import type { BuildContext } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { MediaItem } from "@/lib/project/media";
import type { UploadKind } from "@/lib/upload/upload-files";
import { commitUploaded } from "@/lib/upload/uploaded-result";

type UseTarget = { label: string; element: GeneratedElement };

type Canvas = {
	editor: Editor;
	queue: GenerationQueue;
	buildContext: () => BuildContext;
};

export type MediaUse = {
	label: string;
	kinds: readonly UploadKind[];
	targets: (nodes: Descendant[], kind: UploadKind) => UseTarget[];
	apply: (
		canvas: Canvas,
		element: GeneratedElement,
		item: MediaItem,
	) => void | Promise<void>;
};

const scenesWhere =
	(keep: (visual: ContentElement, kind: UploadKind) => boolean) =>
	(nodes: Descendant[], kind: UploadKind): UseTarget[] =>
		sceneVisuals(nodes)
			.filter(({ visual }) => keep(visual, kind))
			.map(({ sceneNumber, visual }) => ({
				label: sceneLabel(sceneNumber),
				element: visual,
			}));

const pinAsResult: MediaUse["apply"] = (
	{ queue, buildContext },
	element,
	{ kind, url },
) => commitUploaded(queue, buildNode(element, buildContext()), kind, url);

/** Where a piece of the project's media can go, by what it is. */
const MEDIA_USES: readonly MediaUse[] = [
	{
		label: "Character avatar",
		kinds: ["image"],
		targets: (nodes) =>
			getAvatars(nodes).flatMap((avatar) => {
				const name = avatar.generationAttributes?.name;
				return name ? [{ label: name, element: avatar }] : [];
			}),
		apply: pinAsResult,
	},
	{
		label: "Scene visual",
		kinds: ["image", "video"],
		targets: scenesWhere(
			(visual, kind) => CONTENT_TYPES[visual.type].outputKind === kind,
		),
		apply: pinAsResult,
	},
	{
		label: "Start frame",
		kinds: ["image"],
		targets: scenesWhere((visual) => elementOffers(visual, START_FRAME_ATTR)),
		apply: ({ editor }, element, { url }) =>
			mergeAttrs(editor, element.id, openingOn(url)),
	},
	{
		label: "Reference image",
		kinds: ["image"],
		targets: scenesWhere((visual) =>
			elementOffers(visual, REFERENCE_IMAGES_ATTR),
		),
		apply: ({ editor }, element, { url }) =>
			addElementReferences(editor, element.id, REFERENCE_IMAGES_ATTR, [url]),
	},
];

export const usesFor = (kind: UploadKind): MediaUse[] =>
	MEDIA_USES.filter((use) => use.kinds.includes(kind));
