import { describe, expect, it } from "vitest";
import { AccountSchema } from "../account";

describe("AccountSchema", () => {
	it("reads the name and avatar a Google sign-in carries", () => {
		expect(
			AccountSchema.parse({
				email: "ada@example.com",
				user_metadata: {
					full_name: "Ada Lovelace",
					avatar_url: "https://lh3.example.com/ada.png",
					models: { llm: { provider: "anthropic", model: "claude" } },
				},
			}),
		).toEqual({
			email: "ada@example.com",
			name: "Ada Lovelace",
			avatarUrl: "https://lh3.example.com/ada.png",
			models: { llm: { provider: "anthropic", model: "claude" } },
		});
	});

	it("names an email-link sign-in by its mailbox and leaves the avatar unset", () => {
		expect(
			AccountSchema.parse({
				email: "ada@example.com",
				user_metadata: { email_verified: true },
			}),
		).toEqual({
			email: "ada@example.com",
			name: "ada",
			avatarUrl: undefined,
			models: {},
		});
	});

	it("refuses an account with no email", () => {
		expect(AccountSchema.safeParse({ user_metadata: {} }).success).toBe(false);
	});

	it("ignores saved models that are not a model map", () => {
		expect(
			AccountSchema.parse({
				email: "ada@example.com",
				user_metadata: { models: "stale" },
			}).models,
		).toEqual({});
	});
});
