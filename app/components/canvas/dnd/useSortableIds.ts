import { useMemo } from "react";

/** Safe because node ids are nanoids, whose alphabet is `A-Za-z0-9_-`. */
const SEPARATOR = ",";

/**
 * dnd-kit keys its sortable context value on the identity of `items`, and a
 * context change re-renders every `useSortable` consumer under it — straight
 * through slate-react's memoized elements. Slate replaces the children array on
 * every operation, so derive identity from the ids rather than the array.
 */
export function useSortableIds(ids: string[]): string[] {
	const key = ids.join(SEPARATOR);
	return useMemo(() => (key ? key.split(SEPARATOR) : []), [key]);
}
