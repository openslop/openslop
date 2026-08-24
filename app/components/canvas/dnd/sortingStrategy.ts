import {
	verticalListSortingStrategy,
	type SortingStrategy,
} from "@dnd-kit/sortable";

/**
 * Only scenes are listed in the canvas `SortableContext`. dnd-kit still asks the
 * strategy about every other card, and the vertical strategy answers with an
 * identity transform, so an inline `transform` lands on every element in the
 * document each time the pointer crosses onto a scene and is stripped again when
 * it leaves. Returning null for unlisted cards leaves them untouched.
 */
export const displaceListedItems: SortingStrategy = (args) =>
	args.index === -1 ? null : verticalListSortingStrategy(args);
