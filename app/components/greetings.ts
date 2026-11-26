export const TIME_OF_DAY_GREETINGS = {
	lateNight: [
		"Slopping past bedtime, boss?",
		"3am slop hits different.",
		"Nobody's watching. Slop away.",
		"Night shift slop, boss?",
		"Lock in and slopmaxx.",
		"Peak slop incoming, boss.",
	],
	morning: [
		"Morning, boss. Slop's brewing.",
		"Coffee first, then slop?",
		"Early bird gets the slop.",
		"What slop today, boss?",
		"We slopmaxxing today?",
		"Ready to cook absolute slop, boss.",
	],
	afternoon: [
		"Lunch break slop, boss?",
		"Afternoon slump? Slop it out.",
		"Slop o'clock, boss.",
		"What's the slop, boss?",
		"Drop the slop, boss.",
		"Hand over the slop, boss.",
		"Got some slop for me, boss?",
		"Hit me with the slop.",
		"Time to slopmaxx, boss.",
	],
	evening: [
		"Evening slop session, boss?",
		"Prime time slop, boss.",
		"What's the vibe, boss?",
		"What banger are we making?",
		"Slop me up, boss.",
		"Slopmaxxing session, boss?",
	],
};

const DAYPARTS = [
	{ beforeHour: 5, greetings: TIME_OF_DAY_GREETINGS.lateNight },
	{ beforeHour: 12, greetings: TIME_OF_DAY_GREETINGS.morning },
	{ beforeHour: 17, greetings: TIME_OF_DAY_GREETINGS.afternoon },
	{ beforeHour: 22, greetings: TIME_OF_DAY_GREETINGS.evening },
];

function greetingsAt(hour: number): string[] {
	return (
		DAYPARTS.find(({ beforeHour }) => hour < beforeHour)?.greetings ??
		TIME_OF_DAY_GREETINGS.lateNight
	);
}

export function greetingFor(projectId: string, hour: number): string {
	const greetings = greetingsAt(hour);
	return greetings[parseInt(projectId.slice(0, 8), 16) % greetings.length];
}
