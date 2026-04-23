"use client";

import { useEffect, useState } from "react";

const SUGGESTIONS = [
	"a claymation children's story about little red riding hood…",
	"a cinematic AI music video with powerful synthwave energy",
	"an infographic explainer video answering 'what if the world stops spinning?'",
	"a documentary-style video about the rise and fall of Rome…",
	"a heartwarming animal rescue video about a stray dog saved from a flood…",
	"a short animated cat story about a mischievous kitten…",
	"a cinematic space documentary with epic music about the search for alien civilizations…",
	"a dark documentary exploring an unsettling internet mystery…",
	"a \u201CTop 5 Unsolved Archaeological Mysteries\u201D video",
	"a colorful animated children's story about a young rabbit…",
	"a calming bedtime documentary about life in an ancient medieval village…",
];

export default function AnimatedPlaceholder({ active }: { active: boolean }) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (!active) return;
		const id = setInterval(() => {
			setIndex((prev) => (prev + 1) % SUGGESTIONS.length);
		}, 3000);
		return () => clearInterval(id);
	}, [active]);

	return (
		<span
			key={index}
			aria-hidden="true"
			className="animate-fadeInUp pointer-events-none block w-full select-none truncate text-white/30"
		>
			{SUGGESTIONS[index]}
		</span>
	);
}
