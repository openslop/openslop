import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithOtp, signInWithOAuth, signOutFn } = vi.hoisted(() => ({
	signInWithOtp: vi.fn(),
	signInWithOAuth: vi.fn(),
	signOutFn: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
	createClient: () => ({
		auth: {
			signInWithOtp,
			signInWithOAuth,
			signOut: signOutFn,
		},
	}),
}));

import { sendMagicLink, signInWithGoogle, signOut } from "../session";

const CALLBACK = "https://app.test/auth/callback";

beforeEach(() => {
	vi.clearAllMocks();
	signInWithOtp.mockResolvedValue({ error: null });
	signInWithOAuth.mockResolvedValue({ error: null });
	signOutFn.mockResolvedValue({ error: null });
	vi.stubGlobal("window", { location: { origin: "https://app.test" } });
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("sendMagicLink", () => {
	it("omits shouldCreateUser and data when not supplied", async () => {
		await sendMagicLink({ email: "a@b.com" });

		expect(signInWithOtp).toHaveBeenCalledWith({
			email: "a@b.com",
			options: { emailRedirectTo: CALLBACK },
		});
	});

	it("includes shouldCreateUser only when explicitly false", async () => {
		await sendMagicLink({ email: "a@b.com", shouldCreateUser: true });
		expect(signInWithOtp).toHaveBeenLastCalledWith({
			email: "a@b.com",
			options: { emailRedirectTo: CALLBACK },
		});

		await sendMagicLink({ email: "a@b.com", shouldCreateUser: false });
		expect(signInWithOtp).toHaveBeenLastCalledWith({
			email: "a@b.com",
			options: { emailRedirectTo: CALLBACK, shouldCreateUser: false },
		});
	});

	it("forwards otp data when supplied", async () => {
		await sendMagicLink({ email: "a@b.com", data: { plan: "pro" } });

		expect(signInWithOtp).toHaveBeenCalledWith({
			email: "a@b.com",
			options: { emailRedirectTo: CALLBACK, data: { plan: "pro" } },
		});
	});

	it("maps a Supabase error to its message", async () => {
		signInWithOtp.mockResolvedValue({ error: { message: "rate limited" } });

		expect(await sendMagicLink({ email: "a@b.com" })).toEqual({
			error: "rate limited",
		});
	});

	it("returns no error on success", async () => {
		expect(await sendMagicLink({ email: "a@b.com" })).toEqual({});
	});
});

describe("signInWithGoogle", () => {
	it("requests the Google provider with the callback redirect", async () => {
		await signInWithGoogle();

		expect(signInWithOAuth).toHaveBeenCalledWith({
			provider: "google",
			options: { redirectTo: CALLBACK },
		});
	});

	it("throws when the provider redirect fails", async () => {
		signInWithOAuth.mockResolvedValue({ error: new Error("oauth down") });

		await expect(signInWithGoogle()).rejects.toThrow("oauth down");
	});
});

describe("signOut", () => {
	it("delegates to the Supabase client", async () => {
		await signOut();

		expect(signOutFn).toHaveBeenCalledTimes(1);
	});

	it("throws when the session cannot be cleared", async () => {
		signOutFn.mockResolvedValue({ error: new Error("network") });

		await expect(signOut()).rejects.toThrow("network");
	});
});
