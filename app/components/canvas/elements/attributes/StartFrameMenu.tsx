"use client";

import type { Editor } from "slate";
import { useSlate } from "slate-react";
import { InlineMenuTrigger, SelectMenu } from "@/components/ui/select-menu";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";
import { isForeground } from "@/lib/canvas/guards";
import { isSceneElement } from "@/lib/canvas/scenes";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	parseStartFrame,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/startFrame";
import { getPromptText } from "@/lib/generation/inputs";
import { truncateMiddle } from "@/lib/format";
import { useImageUpload } from "@/lib/upload/useImageUpload";

const NONE = "";
const UPLOAD = "upload";
const EXCERPT_CHARS = 40;

type Option = { value: string; label: string };

type Visual = { element: CanvasContentElement; sceneNumber: number };

const visualsOf = (editor: Editor): Visual[] =>
	editor.children.flatMap((node, i) =>
		isSceneElement(node)
			? node.children
					.filter(isForeground)
					.map((element) => ({ element, sceneNumber: i + 1 }))
			: [],
	);

/** Whether following start frames from `id` ever arrives at `target`. */
function reaches(
	id: string,
	target: string,
	byId: Map<string, CanvasContentElement>,
	seen = new Set<string>(),
): boolean {
	if (id === target) return true;
	if (seen.has(id)) return false;
	seen.add(id);
	const frame = parseStartFrame(
		byId.get(id)?.generationAttributes?.[START_FRAME_ATTR],
	);
	return frame?.kind === "element" && reaches(frame.id, target, byId, seen);
}

/**
 * Every visual this clip may open on, named by scene, in document order: all
 * but itself and any whose chain of start frames already leads back to it.
 */
export function visualOptions(editor: Editor, selfId: string): Option[] {
	const visuals = visualsOf(editor);
	const byId = new Map(visuals.map(({ element }) => [element.id, element]));
	return visuals
		.filter(({ element }) => !reaches(element.id, selfId, byId))
		.map(({ element, sceneNumber }) => ({
			value: element.id,
			label: `Scene ${sceneNumber} ${ELEMENT_CONFIGS[element.type].label.toLowerCase()} · ${truncateMiddle(getPromptText(element), EXCERPT_CHARS)}`,
		}));
}

/**
 * The picture a clip opens on: another visual's result (a clip's last frame,
 * an image itself), or a picture of the user's own. A chained clip waits for
 * its source, so chained clips generate one after another.
 */
export function StartFrameMenu({
	element,
	attrKey,
	label,
	hideLabel = false,
}: {
	element: CanvasContentElement;
	attrKey: string;
	label: string;
	hideLabel?: boolean;
}) {
	// Subscribed, not static: the list of other visuals follows the document.
	const editor = useSlate();
	const value = element.generationAttributes?.[attrKey] ?? NONE;
	const frame = parseStartFrame(value);
	const setFrame = (next: string) =>
		updateElementAttrs(editor, element, { [attrKey]: next || null });
	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => url && setFrame(url),
	});

	const visuals = visualOptions(editor, element.id);
	const current =
		frame?.kind === "url"
			? { value, label: "Uploaded picture" }
			: frame && !visuals.some((o) => o.value === frame.id)
				? { value, label: "Deleted visual" }
				: undefined;
	const options: Option[] = [
		{ value: NONE, label: "None" },
		...(current ? [current] : []),
		...visuals,
		{
			value: UPLOAD,
			label: uploading ? "Uploading…" : "Upload your own picture",
		},
	];
	const summary = options.find((o) => o.value === value)?.label ?? "None";
	const tooltip = `${label}: ${summary}`;

	return (
		<>
			<SelectMenu
				value={value}
				onChange={(next) => (next === UPLOAD ? openPicker() : setFrame(next))}
				options={options}
				contentClassName="max-h-64 min-w-56"
			>
				<InlineMenuTrigger aria-label={tooltip}>
					{!hideLabel && <span className="opacity-70 mr-1">{label}</span>}
					<span className="min-w-0 truncate">{summary}</span>
				</InlineMenuTrigger>
			</SelectMenu>
			{inputElement}
		</>
	);
}
