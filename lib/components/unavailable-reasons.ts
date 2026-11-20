export const WAIT_FOR_SLOPPY = "Wait for Sloppy to finish";
export const WAIT_FOR_ELEMENT = "Wait for this element to finish generating";
export const ADD_PROMPT = "Add a prompt first";
export const NOTHING_TO_PLAY = "Nothing to play yet";
export const TYPE_MESSAGE = "Type a message first";

export function animateUnavailableReason({
	sloppyBusy,
	generating,
}: {
	sloppyBusy: boolean;
	generating: boolean;
}): string | null {
	if (sloppyBusy) return WAIT_FOR_SLOPPY;
	if (generating) return WAIT_FOR_ELEMENT;
	return null;
}
