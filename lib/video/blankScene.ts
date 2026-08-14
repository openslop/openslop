import type { ResolvedElement } from "./types";

export const BLANK_SCENE_ID = "blank";

const BLACK_PIXEL =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mNgYGAAAAAEAAHI6uv5AAAAAElFTkSuQmCC";

export function blankScene(opener: ResolvedElement): ResolvedElement {
	return {
		id: BLANK_SCENE_ID,
		type: "image",
		role: "foreground",
		layer: "visual",
		sceneId: opener.sceneId,
		sceneNumber: opener.sceneNumber,
		prompt: "",
		url: BLACK_PIXEL,
		durationSec: opener.durationSec,
		loops: 1,
		volume: 0,
		motion: "none",
	};
}

export const isBlankScene = (element: ResolvedElement) =>
	element.id === BLANK_SCENE_ID;
