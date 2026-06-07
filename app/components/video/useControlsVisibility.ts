import { useEffect, useRef, useState } from "react";

const IDLE_MS = 2000;

export function useControlsVisibility() {
	const [active, setActive] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		},
		[],
	);

	const ping = () => {
		setActive(true);
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setActive(false), IDLE_MS);
	};

	const leave = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		setActive(false);
	};

	return { visible: active, ping, leave };
}
