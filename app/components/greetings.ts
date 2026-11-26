export const GREETINGS = [
	"What slop today, boss?",
	"What's the vibe, boss?",
	"What banger are we making?",
	"What's the slop, boss?",
	"Slop me up, boss.",
	"Ready to cook absolute slop.",
	"What are we yapping about today?",
	"Drop the slop, boss.",
	"Time to cook, boss.",
	"Ready to cook absolute slop, boss.",
	"Hand over the slop, boss.",
	"Got some slop for me, boss?",
	"Hit me with the slop.",
	"Time to slopmaxx, boss.",
	"Slopmaxxing session, boss?",
	"We slopmaxxing today?",
	"Lock in and slopmaxx.",
	"Cook mode: slopmaxx.",
	"Peak slop incoming.",
	"It's giving slop, boss.",
];

// Seeded by the project id so the server and client render the same greeting
export function greetingFor(projectId: string): string {
	return GREETINGS[parseInt(projectId.slice(0, 8), 16) % GREETINGS.length];
}
