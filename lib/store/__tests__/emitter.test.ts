import { describe, expect, it, vi } from "vitest";
import { createEmitter } from "../emitter";

describe("createEmitter", () => {
	it("notifies every subscriber", () => {
		const emitter = createEmitter();
		const first = vi.fn();
		const second = vi.fn();
		emitter.subscribe(first);
		emitter.subscribe(second);

		emitter.notify();

		expect(first).toHaveBeenCalledTimes(1);
		expect(second).toHaveBeenCalledTimes(1);
	});

	it("stops notifying once unsubscribed", () => {
		const emitter = createEmitter();
		const listener = vi.fn();
		const unsubscribe = emitter.subscribe(listener);

		unsubscribe();
		emitter.notify();

		expect(listener).not.toHaveBeenCalled();
	});

	it("subscribes the same listener once", () => {
		const emitter = createEmitter();
		const listener = vi.fn();
		emitter.subscribe(listener);
		emitter.subscribe(listener);

		emitter.notify();

		expect(listener).toHaveBeenCalledTimes(1);
	});
});
