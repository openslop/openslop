// Each template lives in its own file; this barrel assembles them into TEMPLATES
// and exposes lookup helpers. Shared types and the asset URL helper live in ./types.
import { povLife } from "./pov-life";
import { sleepStory } from "./sleep-story";
import { financeTips } from "./finance-tips";
import { trueCrime } from "./true-crime";
import { povFinancialLifestyle } from "./pov-financial-lifestyle";
import { kidsAnimated } from "./kids-animated";
import { psychologyOf } from "./psychology-of";
import type { Template } from "./types";

export type { Template, TemplateShowcase } from "./types";

export const TEMPLATES: Template[] = [
	povLife,
	sleepStory,
	financeTips,
	trueCrime,
	povFinancialLifestyle,
	kidsAnimated,
	psychologyOf,
];

const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplateById(id: string): Template | undefined {
	return TEMPLATE_MAP.get(id);
}
