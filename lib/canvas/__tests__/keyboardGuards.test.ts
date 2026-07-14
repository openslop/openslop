import { describe, expect, it } from "vitest";
import {
	shouldInsertNewlineOnEnter,
	type EnterKeyEvent,
} from "../keyboardGuards";

const target = (isContentEditable: boolean) =>
	({ isContentEditable }) as unknown as EventTarget;

const enterEvent = (overrides: Partial<EnterKeyEvent> = {}): EnterKeyEvent => ({
	key: "Enter",
	ctrlKey: false,
	metaKey: false,
	altKey: false,
	keyCode: 13,
	nativeEvent: { isComposing: false },
	target: target(true),
	...overrides,
});

describe("shouldInsertNewlineOnEnter", () => {
	it("inserts a newline on plain Enter", () => {
		expect(shouldInsertNewlineOnEnter(enterEvent())).toBe(true);
	});

	it("ignores non-Enter keys", () => {
		expect(shouldInsertNewlineOnEnter(enterEvent({ key: "a" }))).toBe(false);
	});

	it("leaves Ctrl+Enter alone for generation shortcuts", () => {
		expect(shouldInsertNewlineOnEnter(enterEvent({ ctrlKey: true }))).toBe(
			false,
		);
	});

	it("leaves Cmd/Meta+Enter alone", () => {
		expect(shouldInsertNewlineOnEnter(enterEvent({ metaKey: true }))).toBe(
			false,
		);
	});

	it("leaves Alt+Enter alone", () => {
		expect(shouldInsertNewlineOnEnter(enterEvent({ altKey: true }))).toBe(
			false,
		);
	});

	it("does not hijack Enter that commits an IME composition", () => {
		expect(
			shouldInsertNewlineOnEnter(
				enterEvent({ nativeEvent: { isComposing: true } }),
			),
		).toBe(false);
	});

	it("falls back to keyCode 229 for browsers that don't set isComposing", () => {
		expect(
			shouldInsertNewlineOnEnter(
				enterEvent({ keyCode: 229, nativeEvent: { isComposing: false } }),
			),
		).toBe(false);
	});

	it("does not hijack Enter bubbling up from non-editable chrome (button, menu)", () => {
		expect(
			shouldInsertNewlineOnEnter(enterEvent({ target: target(false) })),
		).toBe(false);
	});

	it("does not throw or fire when the target is missing", () => {
		expect(shouldInsertNewlineOnEnter(enterEvent({ target: null }))).toBe(
			false,
		);
	});
});
