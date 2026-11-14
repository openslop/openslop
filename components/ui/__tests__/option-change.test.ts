import { describe, expect, it, vi } from "vitest";
import { onOptionChange } from "../option-change";

const options = [{ value: "a" }, { value: "b" }] as const;

describe("onOptionChange", () => {
	it("passes a listed option to onChange", () => {
		const onChange = vi.fn();
		onOptionChange(options, onChange)("b");
		expect(onChange).toHaveBeenCalledWith("b");
	});

	it("ignores a cleared or unknown value", () => {
		const onChange = vi.fn();
		onOptionChange(options, onChange)("");
		onOptionChange(options, onChange)("z");
		expect(onChange).not.toHaveBeenCalled();
	});
});
