export const ZERO_WIDTH_SPACE = "\u200B";

/**
 * Content elements lead with a zero-width leaf so backspacing past the start of
 * an element cannot delete the element by accident (#438): the first backspace
 * eats the marker, and only a second one removes the element. That leaf is
 * structure, not content, so
 * anything reading an element as authored text has to drop it \u2014 otherwise it
 * round trips into the saved script and comes back doubled.
 */
export const withoutCaretMarker = (text: string): string =>
	text.replaceAll(ZERO_WIDTH_SPACE, "");

/** The line a serialized script puts between one scene and the next. */
export const SCENE_MARKER_PATTERN = /^---\s*Scene\s+\d+\s*---\s*$/m;
