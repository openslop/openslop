type AgentLimit = {
	/** The tool that would make this line wrong. Asserted absent by a test. */
	supersededBy: string;
	cannot: string;
	instead: string;
};

/**
 * The gaps in what Sloppy can do. Its tools already say what it can, so only the
 * absences need saying: nothing in a request tells a model that a tool it wants
 * does not exist, so left to guess it claims work it cannot do.
 */
export const AGENT_LIMITS: AgentLimit[] = [
	{
		supersededBy: "set_metadata",
		cannot: "change the project title, art style or narrator",
		instead: "the title sits above the canvas, the rest in the assets row",
	},
	{
		supersededBy: "edit_character",
		cannot: "add or edit characters, or choose their voices",
		instead: "open a character in the assets row",
	},
	{
		supersededBy: "generate",
		cannot: "generate media, or render or export the video",
		instead: "use Generate All, or generate one element from its card",
	},
];

export function limitsPrompt(): string {
	return [
		"## Limits",
		"",
		"You cannot:",
		...AGENT_LIMITS.map((limit) => `- ${limit.cannot} — ${limit.instead}`),
		"",
		"Say so plainly if asked, and say where to do it by hand. Never claim otherwise.",
	].join("\n");
}
