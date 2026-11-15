export const IDEAS = [
	"Create a claymation children's story about Little Red Riding Hood",
	"Create a cinematic AI music video with powerful synthwave energy",
	"Create an infographic explainer answering 'what if the world stopped spinning?'",
	"Create a documentary-style video about the rise and fall of Rome",
	"Create a heartwarming rescue story about a stray dog saved from a flood",
	"Create a short animated story about a mischievous kitten",
	"Create a cinematic space documentary about the search for alien life",
	"Create a dark documentary exploring an unsettling internet mystery",
	"Create a Top 5 video on unsolved archaeological mysteries",
	"Create a colorful animated children's story about a young rabbit",
	"Create a calming bedtime documentary about life in a medieval village",
];

export function nextIdea(current: string): string {
	const pool = IDEAS.filter((idea) => idea !== current);
	return pool[Math.floor(Math.random() * pool.length)];
}
