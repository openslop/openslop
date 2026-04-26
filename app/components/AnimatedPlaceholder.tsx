"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

const TYPING_MS = 40;
const ERASING_MS = 25;
const PAUSE_AFTER_TYPE_MS = 2000;
const PAUSE_AFTER_ERASE_MS = 300;

export default function AnimatedPlaceholder({ active }: { active: boolean }) {
	const [display, setDisplay] = useState("");
	const indexRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clear = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (!active) return;

		let count = 0;
		let text = SUGGESTIONS[indexRef.current];

		function tick() {
			count++;
			setDisplay(text.slice(0, count));
			if (count < text.length) {
				timerRef.current = setTimeout(tick, TYPING_MS);
			} else {
				timerRef.current = setTimeout(eraseTick, PAUSE_AFTER_TYPE_MS);
			}
		}

		function eraseTick() {
			count--;
			setDisplay(text.slice(0, count));
			if (count > 0) {
				timerRef.current = setTimeout(eraseTick, ERASING_MS);
			} else {
				timerRef.current = setTimeout(nextSuggestion, PAUSE_AFTER_ERASE_MS);
			}
		}

		function nextSuggestion() {
			indexRef.current = (indexRef.current + 1) % SUGGESTIONS.length;
			text = SUGGESTIONS[indexRef.current];
			count = 0;
			tick();
		}

		timerRef.current = setTimeout(tick, TYPING_MS);

		return clear;
	}, [active, clear]);

	return (
		<span
			aria-hidden="true"
			className="pointer-events-none block w-full select-none text-white/30"
		>
			Create {display}
		</span>
	);
}
