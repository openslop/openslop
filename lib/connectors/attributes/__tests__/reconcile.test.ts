import { describe, expect, it } from "vitest";
import { AttributeSchema } from "../schema";
import { reconcileAttributes } from "../reconcile";

describe("reconcileAttributes", () => {
	it("drops keys the new schema no longer has", () => {
		const oldSchema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
			{ key: "motion", label: "Motion", default: "none" },
		]);
		const newSchema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
		]);

		const delta = reconcileAttributes(oldSchema, newSchema, {
			volume: "8",
			motion: "kenBurnsIn",
		});

		expect(delta).toEqual({ motion: null });
	});

	it("fills defaults for keys the new schema gained that aren't already set", () => {
		const oldSchema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
		]);
		const newSchema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
			{ key: "seed", label: "Seed", default: "0" },
		]);

		const delta = reconcileAttributes(oldSchema, newSchema, { volume: "8" });

		expect(delta).toEqual({ seed: "0" });
	});

	it("does not overwrite an already-set value for a key the new schema keeps", () => {
		const oldSchema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
		]);
		const newSchema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "9" },
		]);

		const delta = reconcileAttributes(oldSchema, newSchema, { volume: "3" });

		expect(delta).toEqual({});
	});

	it("leaves a kept key alone when its value is missing", () => {
		const schema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
		]);

		expect(reconcileAttributes(schema, schema, {})).toEqual({});
	});

	it("never touches attrs outside both schemas (e.g. provider metadata)", () => {
		const oldSchema = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
		]);
		const newSchema = AttributeSchema.from([]);

		const delta = reconcileAttributes(oldSchema, newSchema, {
			volume: "8",
			provider: "openslop",
			characters: "Red,Granny",
		});

		expect(delta).toEqual({ volume: null });
	});

	it("resets a kept key to its default once the new schema stops offering its value", () => {
		const oldSchema = AttributeSchema.from([
			{
				key: "resolution",
				label: "Resolution",
				edit: { kind: "enum", options: ["720p", "1080p"] },
				default: "720p",
			},
		]);
		const newSchema = AttributeSchema.from([
			{
				key: "resolution",
				label: "Resolution",
				edit: { kind: "enum", options: ["720p"] },
				default: "720p",
			},
		]);

		expect(
			reconcileAttributes(oldSchema, newSchema, { resolution: "1080p" }),
		).toEqual({ resolution: "720p" });
		expect(
			reconcileAttributes(oldSchema, newSchema, { resolution: "720p" }),
		).toEqual({});
	});
});
