import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { toastError } from "../toastError";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const errorToast = vi.mocked(toast.error);

describe("toastError", () => {
	beforeEach(() => {
		errorToast.mockReset();
	});

	it("shows the error's message, not its serialized form", () => {
		toastError(new Error("Upload failed"));
		expect(errorToast).toHaveBeenCalledWith("Upload failed");
	});

	it("prefixes the label when one is given", () => {
		toastError(new Error("network down"), "Could not create project");
		expect(errorToast).toHaveBeenCalledWith(
			"Could not create project: network down",
		);
	});

	it("stringifies non-Error causes", () => {
		toastError("plain rejection");
		expect(errorToast).toHaveBeenCalledWith("plain rejection");
	});

	it("never leaks a stack trace", () => {
		const error = new Error("boom");
		error.stack = "Error: boom\n    at secret/path.ts:1:1";
		toastError(error);
		expect(errorToast).toHaveBeenCalledWith("boom");
	});
});
