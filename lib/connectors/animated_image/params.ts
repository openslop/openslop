import omit from "lodash/omit";
import pick from "lodash/pick";
import type { AnimatedImageGenerateParams } from "../types";

const VIDEO_ONLY_KEYS = [
	"videoPrompt",
	"videoWidth",
	"videoHeight",
	"duration",
] as const;

/** Params that drive only the video step for `model`; the still is independent of them. */
const videoOnlyKeysFor = (_model?: string): typeof VIDEO_ONLY_KEYS =>
	VIDEO_ONLY_KEYS;

type VideoOnlyKey = (typeof VIDEO_ONLY_KEYS)[number];

export const stillParamsFor = <T extends object>(
	model: string | undefined,
	params: T,
): Omit<T, VideoOnlyKey> =>
	omit(params, videoOnlyKeysFor(model)) as Omit<T, VideoOnlyKey>;

export const videoParamsFor = (
	model: string | undefined,
	params: AnimatedImageGenerateParams,
) => pick(params, videoOnlyKeysFor(model));

export type VideoParams = ReturnType<typeof videoParamsFor>;
