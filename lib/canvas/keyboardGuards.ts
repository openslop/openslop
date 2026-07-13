export type EnterKeyEvent = {
	key: string;
	ctrlKey: boolean;
	metaKey: boolean;
	altKey: boolean;
	keyCode: number;
	nativeEvent: { isComposing?: boolean };
};

// IME composition (CJK, etc.) also commits via Enter — don't hijack that
// keydown into a newline, or it clobbers the composition. `keyCode === 229`
// is the long-standing fallback for browsers that don't set isComposing
// reliably.
export function shouldInsertNewlineOnEnter(event: EnterKeyEvent): boolean {
	if (event.nativeEvent.isComposing || event.keyCode === 229) return false;
	return (
		event.key === "Enter" && !event.ctrlKey && !event.metaKey && !event.altKey
	);
}
