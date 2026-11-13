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
	"a “Top 5 Unsolved Archaeological Mysteries” video",
	"a colorful animated children's story about a young rabbit…",
	"a calming bedtime documentary about life in an ancient medieval village…",
];

const TYPING_MS = 40;
const ERASING_MS = 25;
const PAUSE_AFTER_TYPE_MS = 2000;
const PAUSE_AFTER_ERASE_MS = 300;

export default function AnimatedPlaceholder() {
	const [display, setDisplay] = useState("");

	useEffect(() => {
		let index = 0;
		let text = SUGGESTIONS[index];
		let count = 0;
		let timer = setTimeout(typeStep, TYPING_MS);

		function typeStep() {
			count++;
			setDisplay(text.slice(0, count));
			timer =
				count < text.length
					? setTimeout(typeStep, TYPING_MS)
					: setTimeout(eraseStep, PAUSE_AFTER_TYPE_MS);
		}

		function eraseStep() {
			count--;
			setDisplay(text.slice(0, count));
			timer =
				count > 0
					? setTimeout(eraseStep, ERASING_MS)
					: setTimeout(nextSuggestion, PAUSE_AFTER_ERASE_MS);
		}

		function nextSuggestion() {
			index = (index + 1) % SUGGESTIONS.length;
			text = SUGGESTIONS[index];
			count = 0;
			typeStep();
		}

		return () => clearTimeout(timer);
	}, []);

	return (
		<span
			aria-hidden="true"
			className="pointer-events-none block w-full select-none text-muted-foreground"
		>
			Create {display}
		</span>
	);
}
