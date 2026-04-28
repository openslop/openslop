export interface Template {
	id: string;
	name: string;
	pillText: string;
	color: string;
}

export const TEMPLATES: Template[] = [
	{
		id: "pov-life",
		name: "POV Life",
		pillText: "POV: Your life at every stage as a",
		color: "#F59E0B",
	},
	{
		id: "sleep-story",
		name: "Sleep Story",
		pillText: "A sleep story about",
		color: "#6366F1",
	},
	{
		id: "kids-animated",
		name: "Kids Animated",
		pillText: "A kids animated story about",
		color: "#10B981",
	},
	{
		id: "psychology-of",
		name: "Psychology",
		pillText: "Psychology of",
		color: "#EC4899",
	},
];

export const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplateById(id: string): Template | undefined {
	return TEMPLATE_MAP.get(id);
}
