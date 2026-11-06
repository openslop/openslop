import type { AttributeChanges } from "./editor-ops";
import type { SplitAttributes } from "./types";

export const RESULT_TRIMS_KEY = "resultTrims";

export type ResultTrim = {
	trimStart?: string;
	trimDuration?: string;
};

export function readResultTrims(
	element: SplitAttributes,
): Record<string, ResultTrim> {
	const raw = element.layoutAttributes?.[RESULT_TRIMS_KEY];
	if (!raw) return {};
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
			return {};
		return parsed as Record<string, ResultTrim>;
	} catch {
		return {};
	}
}

export function bareResultTrim(element: SplitAttributes): ResultTrim | null {
	const trimStart = element.layoutAttributes?.trimStart;
	const trimDuration = element.layoutAttributes?.trimDuration;
	if (trimStart === undefined && trimDuration === undefined) return null;
	return {
		...(trimStart !== undefined ? { trimStart } : {}),
		...(trimDuration !== undefined ? { trimDuration } : {}),
	};
}

export const trimToAttrs = (
	trim: ResultTrim | null | undefined,
): AttributeChanges => ({
	trimStart: trim?.trimStart ?? null,
	trimDuration: trim?.trimDuration ?? null,
});

const sameTrim = (a: ResultTrim | null, b: ResultTrim | null): boolean =>
	(a?.trimStart ?? undefined) === (b?.trimStart ?? undefined) &&
	(a?.trimDuration ?? undefined) === (b?.trimDuration ?? undefined);

export function writeActiveResultTrim(
	element: SplitAttributes,
	identity: string,
	trim: ResultTrim | null,
): AttributeChanges {
	const map = { ...readResultTrims(element) };
	if (trim === null) delete map[identity];
	else map[identity] = trim;
	return {
		[RESULT_TRIMS_KEY]: JSON.stringify(map),
		...trimToAttrs(trim),
	};
}

/** Bare trim follows the active result; a legacy bare trim seeds the map once. */
export function syncResultTrimAttrs(
	element: SplitAttributes,
	previousIdentity: string | null,
	nextIdentity: string | null,
): AttributeChanges | null {
	if (previousIdentity === nextIdentity) return null;

	const map = { ...readResultTrims(element) };
	const bare = bareResultTrim(element);
	let mapChanged = false;

	if (previousIdentity === null) {
		if (Object.keys(map).length === 0 && bare && nextIdentity) {
			map[nextIdentity] = bare;
			mapChanged = true;
		}
	} else if (bare) {
		if (!sameTrim(map[previousIdentity] ?? null, bare)) {
			map[previousIdentity] = bare;
			mapChanged = true;
		}
	} else if (previousIdentity in map) {
		delete map[previousIdentity];
		mapChanged = true;
	}

	const nextTrim = nextIdentity ? (map[nextIdentity] ?? null) : null;
	const nextBare = trimToAttrs(nextTrim);
	const sameBare = sameTrim(bare, nextTrim);

	if (!mapChanged && sameBare) return null;

	return {
		...(mapChanged ? { [RESULT_TRIMS_KEY]: JSON.stringify(map) } : {}),
		...nextBare,
	};
}
