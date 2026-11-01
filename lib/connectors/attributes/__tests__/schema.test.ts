import { z } from "zod";
import { describe, expect, it } from "vitest";
import { Play } from "@/components/ui/icon";
import { toggleValue, trimStartDef } from "../common";
import { AttributeSchema } from "../schema";

describe("AttributeSchema", () => {
	it("keeps hidden and control-less attributes out of the settings, in def order", () => {
		const schema = AttributeSchema.from([
			{ key: "provider", label: "Provider" },
			{ key: "name", label: "Name", edit: { kind: "text" }, hidden: true },
			{ key: "loops", label: "Loops", edit: { kind: "text" }, default: "1" },
			{ key: "volume", label: "Volume", edit: { kind: "text" }, default: "2" },
		]);

		expect(schema.settingsDefs.map(({ key }) => key)).toEqual([
			"loops",
			"volume",
		]);
		expect(schema.defaultAttributes).toEqual({
			loops: "1",
			volume: "2",
		});
	});

	it("omits defs with no default from defaultAttributes", () => {
		const schema = AttributeSchema.from([
			{
				key: "startFrame",
				label: "Start frame",
				edit: { kind: "frame", value: z.string() },
			},
		]);

		expect(schema.defaultAttributes).toEqual({});
	});

	describe("resolve", () => {
		const schema = AttributeSchema.from([
			{
				key: "model",
				label: "Model",
				edit: { kind: "enum", value: z.enum(["a", "b"]) },
				default: "a",
			},
			{
				key: "motion",
				label: "Motion",
				edit: { kind: "enum", value: z.enum(["x"]) },
			},
			{ key: "prompt", label: "Prompt", edit: { kind: "text" } },
			{
				key: "loop",
				label: "Loop",
				edit: {
					kind: "toggle",
					value: toggleValue,
					on: { icon: Play, label: "On" },
					off: { icon: Play, label: "Off" },
				},
				default: "false",
			},
		]);

		it("offers seconds as any plain number, since reading clamps it", () => {
			const seconds = AttributeSchema.from([trimStartDef]);
			expect(seconds.offers("trimStart", "2.5")).toBe(true);
			expect(seconds.offers("trimStart", "0.5")).toBe(true);
			expect(seconds.offers("trimStart", "2s")).toBe(false);
			expect(seconds.resolve({ trimStart: "nope" })).toEqual({});
		});

		it("fills defaults for attributes the caller left unset", () => {
			expect(schema.resolve({})).toEqual({ model: "a", loop: "false" });
		});

		it("offers a toggle only its two boolean values", () => {
			expect(schema.resolve({ loop: "true" })).toMatchObject({ loop: "true" });
			expect(schema.resolve({ loop: "yes" })).toMatchObject({ loop: "false" });
		});

		it("falls back to the default when a value is not an offered option", () => {
			expect(schema.resolve({ model: "nope" })).toEqual({
				model: "a",
				loop: "false",
			});
		});

		it("drops an unoffered value when the def has no default", () => {
			expect(schema.resolve({ motion: "nope" })).toEqual({
				model: "a",
				loop: "false",
			});
		});

		it("keeps offered values and drops keys outside the schema", () => {
			expect(schema.resolve({ model: "b", extra: "dropped" })).toEqual({
				model: "b",
				loop: "false",
			});
		});
	});

	it("offers no value for a key outside the schema, and any for a key with no control", () => {
		const schema = AttributeSchema.from([{ key: "name", label: "Name" }]);

		expect(schema.offers("name", "Mia")).toBe(true);
		expect(schema.offers("extra", "Mia")).toBe(false);
	});

	it("offers what the control's value schema accepts", () => {
		const schema = AttributeSchema.from([
			{ key: "code", label: "Code", edit: { kind: "frame", value: z.url() } },
		]);

		expect(schema.offers("code", "https://img/a.png")).toBe(true);
		expect(schema.offers("code", "nope")).toBe(false);
	});

	it("keeps a model's own attributes out of those every model has", () => {
		const schema = AttributeSchema.from([
			{ key: "motion", label: "Motion" },
			{ key: "resolution", label: "Resolution", perModel: true },
		]);

		expect(schema.baseDefs.map(({ key }) => key)).toEqual(["motion"]);
	});
});
