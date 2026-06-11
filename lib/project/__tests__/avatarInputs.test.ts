import { describe, expect, it } from "vitest";
import type { MetadataCharacter } from "../types";
import {
	avatarInputsSignature,
	backfillAvatarSignatures,
	isAvatarStale,
} from "../avatarInputs";

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

describe("backfillAvatarSignatures", () => {
	it("stamps a baseline only for generated avatars missing a signature", () => {
		const stamped = backfillAvatarSignatures(
			{
				Legacy: { appearance: "A girl in red", avatarUrl: "u" },
				Signed: {
					appearance: "x",
					avatarUrl: "u",
					avatarInputsSignature: "keep",
				},
				Uploaded: { appearance: "y", avatarUrl: "u", avatarUploaded: true },
				NoAvatar: { appearance: "z" },
				NoAppearance: { appearance: "", avatarUrl: "u" },
			},
			"anime",
			["ref-a"],
		);

		expect(Object.keys(stamped)).toEqual(["Legacy"]);
		expect(stamped["Legacy"]).toBe(
			avatarInputsSignature("A girl in red", "anime", ["ref-a"]),
		);
	});

	it("returns nothing to stamp when every avatar is already covered", () => {
		const stamped = backfillAvatarSignatures(
			{
				Signed: { appearance: "x", avatarUrl: "u", avatarInputsSignature: "s" },
			},
			undefined,
			[],
		);
		expect(stamped).toEqual({});
	});
});
