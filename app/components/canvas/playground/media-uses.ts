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
import type { MediaItem } from "@/lib/project/media";
import type { UploadKind } from "@/lib/upload/upload-files";

type UseTarget = { label: string; element: GeneratedElement };

export type UseContext = {
	editor: Editor;
	/** Shows the media as the element's result, as an upload to it would. */
	showAsResult: (element: GeneratedElement, item: MediaItem) => Promise<void>;
};

export type MediaUse = {
	label: string;
	kinds: readonly UploadKind[];
	targets: (nodes: Descendant[], kind: UploadKind) => UseTarget[];
	apply: (
		context: UseContext,
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

const showAsResult: MediaUse["apply"] = (context, element, item) =>
	context.showAsResult(element, item);

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
		apply: showAsResult,
	},
	{
		label: "Scene visual",
		kinds: ["image", "video"],
		targets: scenesWhere(
			(visual, kind) => CONTENT_TYPES[visual.type].outputKind === kind,
		),
		apply: showAsResult,
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
