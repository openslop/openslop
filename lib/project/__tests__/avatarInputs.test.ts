import { describe, expect, it } from "vitest";
import type { MetadataCharacter } from "../types";
import { avatarInputsSignature, isAvatarStale } from "../avatarInputs";

const character = (over: Partial<MetadataCharacter>): MetadataCharacter => ({
	appearance: "A girl in red",
	avatarUrl: "https://img/alice.png",
	...over,
});

describe("isAvatarStale", () => {
	it("is false when the current inputs match the recorded signature", () => {
		const ch = character({
			avatarInputsSignature: avatarInputsSignature("A girl in red", "anime", [
				"ref-a",
			]),
		});
		expect(isAvatarStale(ch, "anime", ["ref-a"])).toBe(false);
	});

	it("is true when the appearance changed", () => {
		const ch = character({
			appearance: "A girl in blue",
			avatarInputsSignature: avatarInputsSignature(
				"A girl in red",
				"anime",
				[],
			),
		});
		expect(isAvatarStale(ch, "anime", [])).toBe(true);
	});

	it("is true when the project art style changed", () => {
		const ch = character({
			avatarInputsSignature: avatarInputsSignature(
				"A girl in red",
				"anime",
				[],
			),
		});
		expect(isAvatarStale(ch, "watercolor", [])).toBe(true);
	});

	it("is true when reference images changed", () => {
		const ch = character({
			avatarInputsSignature: avatarInputsSignature("A girl in red", "anime", [
				"ref-a",
			]),
		});
		expect(isAvatarStale(ch, "anime", ["ref-a", "ref-b"])).toBe(true);
	});

	it("is never stale for an uploaded avatar", () => {
		const ch = character({
			avatarUploaded: true,
			appearance: "A girl in blue",
			avatarInputsSignature: avatarInputsSignature(
				"A girl in red",
				"anime",
				[],
			),
		});
		expect(isAvatarStale(ch, "anime", [])).toBe(false);
	});

	it("is not stale for a legacy avatar with no recorded signature", () => {
		const ch = character({ appearance: "A girl in blue" });
		expect(isAvatarStale(ch, "anime", [])).toBe(false);
	});

	it("is not stale when there is no avatar yet", () => {
		const ch = character({ avatarUrl: undefined });
		expect(isAvatarStale(ch, "anime", [])).toBe(false);
	});
});
