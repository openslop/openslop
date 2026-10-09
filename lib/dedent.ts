import baseDedent from "dedent";

/** Indents an interpolated multi-line value to its line, which plain dedent does not. */
export const dedent = baseDedent.withOptions({ alignValues: true });
