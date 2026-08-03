export const ZERO_WIDTH_SPACE = "\u200B";

/**
 * Content elements lead with a zero-width leaf so a collapsed element still has
 * somewhere to put the caret (#438). That leaf is structure, not content, so
 * anything reading an element as authored text has to drop it \u2014 otherwise it
 * round trips into the saved script and comes back doubled.
 */
export const withoutCaretMarker = (text: string): string =>
	text.replaceAll(ZERO_WIDTH_SPACE, "");
