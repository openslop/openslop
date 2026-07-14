export type EnterKeyEvent = {
	key: string;
	ctrlKey: boolean;
	metaKey: boolean;
	altKey: boolean;
	keyCode: number;
	nativeEvent: { isComposing: boolean };
	target: EventTarget;
};

export function shouldInsertNewlineOnEnter(event: EnterKeyEvent): boolean {
	// IME (CJK) commits with Enter; keyCode 229 catches browsers that don't set
	// isComposing reliably.
	if (event.nativeEvent.isComposing || event.keyCode === 229) return false;
	if (event.key !== "Enter" || event.ctrlKey || event.metaKey || event.altKey)
		return false;
	// Radix portals chrome out of the editor DOM but it still bubbles through the
	// React tree, so closest() can't see it. isContentEditable is portal-proof.
	return (event.target as HTMLElement).isContentEditable;
}
