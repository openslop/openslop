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

export const TIME_OF_DAY_GREETINGS = {
	lateNight: [
		"Slopping past bedtime, boss?",
		"3am slop hits different.",
		"Nobody's watching. Slop away.",
		"Night shift slop, boss?",
		"Can't sleep? Slop.",
	],
	morning: [
		"Morning, boss. Slop's brewing.",
		"Coffee first, then slop?",
		"Early bird gets the slop.",
		"Fresh slop, first thing.",
	],
	afternoon: [
		"Lunch break slop, boss?",
		"Afternoon slump? Slop it out.",
		"Slop o'clock, boss.",
	],
	evening: [
		"Clocked out. Clocked into slop.",
		"Evening slop session, boss?",
		"Prime time slop, boss.",
	],
};

const DAYPARTS = [
	{ beforeHour: 5, greetings: TIME_OF_DAY_GREETINGS.lateNight },
	{ beforeHour: 12, greetings: TIME_OF_DAY_GREETINGS.morning },
	{ beforeHour: 17, greetings: TIME_OF_DAY_GREETINGS.afternoon },
	{ beforeHour: 22, greetings: TIME_OF_DAY_GREETINGS.evening },
];

function greetingsAt(hour: number | undefined): string[] {
	if (hour === undefined) return GREETINGS;
	return (
		DAYPARTS.find(({ beforeHour }) => hour < beforeHour)?.greetings ??
		TIME_OF_DAY_GREETINGS.lateNight
	);
}

// Seeded by the project id; the server has no local hour, so it renders a generic greeting
export function greetingFor(projectId: string, hour?: number): string {
	const greetings = greetingsAt(hour);
	return greetings[parseInt(projectId.slice(0, 8), 16) % greetings.length];
}
