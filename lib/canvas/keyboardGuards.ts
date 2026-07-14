export type EnterKeyEvent = {
	key: string;
	ctrlKey: boolean;
	metaKey: boolean;
	altKey: boolean;
	keyCode: number;
	nativeEvent: { isComposing?: boolean };
	target: EventTarget | null;
};

export function shouldInsertNewlineOnEnter(event: EnterKeyEvent): boolean {
	// IME composition (CJK, etc.) also commits via Enter — don't hijack that
	// keydown into a newline, or it clobbers the composition. `keyCode === 229`
	// is the long-standing fallback for browsers that don't set isComposing.
	if (event.nativeEvent.isComposing || event.keyCode === 229) return false;
	if (event.key !== "Enter" || event.ctrlKey || event.metaKey || event.altKey)
		return false;
	// Only hijack Enter inside editable text. This handler sits on <Editable>
	// and every focused control bubbles its keydown here — including Radix
	// popovers/tooltips, which are portaled OUT of the editor's DOM subtree but
	// still bubble through React's tree, so a DOM `closest()` can't see them.
	// isContentEditable is the direct, portal-proof check.
	return (event.target as HTMLElement | null)?.isContentEditable === true;
}
