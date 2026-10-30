import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { ApiError } from "../clients/http";
import { toastError } from "../toast-error";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const errorToast = vi.mocked(toast.error);

describe("toastError", () => {
	beforeEach(() => {
		errorToast.mockReset();
	});

	it("shows the error's message, not its serialized form", () => {
		toastError(new Error("Upload failed"));
		expect(errorToast).toHaveBeenCalledWith("Upload failed", expect.anything());
	});

	it("prefixes the label when one is given", () => {
		toastError(new Error("network down"), "Could not create project");
		expect(errorToast).toHaveBeenCalledWith(
			"Could not create project: network down",
			expect.anything(),
		);
	});

	it("stringifies non-Error causes", () => {
		toastError("plain rejection");
		expect(errorToast).toHaveBeenCalledWith(
			"plain rejection",
			expect.anything(),
		);
	});

	it("never leaks a stack trace", () => {
		const error = new Error("boom");
		error.stack = "Error: boom\n    at secret/path.ts:1:1";
		toastError(error);
		expect(errorToast).toHaveBeenCalledWith("boom", expect.anything());
	});

	it("stays open until the user dismisses it", () => {
		toastError(new Error("boom"));
		expect(errorToast).toHaveBeenCalledWith("boom", {
			duration: Number.POSITIVE_INFINITY,
			closeButton: true,
		});
	});

	it("shows the request id a failed route answered with", () => {
		toastError(new ApiError("Export failed", "iad1::abc-123"));
		expect(errorToast).toHaveBeenCalledWith("Export failed", {
			duration: Number.POSITIVE_INFINITY,
			closeButton: true,
			description: "Request iad1::abc-123",
		});
	});

	it("lets caller options override the defaults", () => {
		toastError(new Error("boom"), "Save failed", {
			id: "autosave",
			duration: 4000,
		});
		expect(errorToast).toHaveBeenCalledWith("Save failed: boom", {
			duration: 4000,
			closeButton: true,
			id: "autosave",
		});
	});
});
