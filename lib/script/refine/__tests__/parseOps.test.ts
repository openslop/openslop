import { describe, expect, it } from "vitest";
import { RefineOpParser } from "../parseOps";

describe("RefineOpParser", () => {
	it("parses a complete JSONL line", () => {
		const parser = new RefineOpParser();
		const ops = parser.push('{"op":"remove","id":"abc"}\n');
		expect(ops).toEqual([{ op: "remove", id: "abc" }]);
	});

	it("buffers partial lines until newline", () => {
		const parser = new RefineOpParser();
		expect(parser.push('{"op":"remo')).toEqual([]);
		expect(parser.push('ve","id":"abc"}\n')).toEqual([
			{ op: "remove", id: "abc" },
		]);
	});

	it("parses multiple lines in one chunk", () => {
		const parser = new RefineOpParser();
		const ops = parser.push(
			'{"op":"remove","id":"a"}\n{"op":"remove","id":"b"}\n',
		);
		expect(ops).toHaveLength(2);
		expect(ops[0]).toEqual({ op: "remove", id: "a" });
		expect(ops[1]).toEqual({ op: "remove", id: "b" });
	});

	it("skips malformed JSON lines", () => {
		const parser = new RefineOpParser();
		const ops = parser.push('not json\n{"op":"remove","id":"a"}\n');
		expect(ops).toEqual([{ op: "remove", id: "a" }]);
	});

	it("skips empty lines", () => {
		const parser = new RefineOpParser();
		const ops = parser.push('\n\n{"op":"remove","id":"a"}\n\n');
		expect(ops).toEqual([{ op: "remove", id: "a" }]);
	});

	it("handles streaming across multiple push calls", () => {
		const parser = new RefineOpParser();
		expect(parser.push('{"op":')).toEqual([]);
		expect(parser.push('"set","id":"x","text":"hello"}\n')).toEqual([
			{ op: "set", id: "x", text: "hello" },
		]);
		expect(parser.push('{"op":"remove","id":"y"}\n')).toEqual([
			{ op: "remove", id: "y" },
		]);
	});

	it("parses insert ops with all fields", () => {
		const parser = new RefineOpParser();
		const ops = parser.push(
			'{"op":"insert","anchor_id":"x","position":"before","type":"sound","attrs":{"loops":"3"},"text":"rain"}\n',
		);
		expect(ops).toEqual([
			{
				op: "insert",
				anchor_id: "x",
				position: "before",
				type: "sound",
				attrs: { loops: "3" },
				text: "rain",
			},
		]);
	});

	it("flush emits the last line without trailing newline", () => {
		const parser = new RefineOpParser();
		expect(parser.push('{"op":"remove","id":"a"}')).toEqual([]);
		expect(parser.flush()).toEqual([{ op: "remove", id: "a" }]);
	});

	it("flush returns empty when buffer is empty", () => {
		const parser = new RefineOpParser();
		parser.push('{"op":"remove","id":"a"}\n');
		expect(parser.flush()).toEqual([]);
	});

	it("flush skips malformed trailing content", () => {
		const parser = new RefineOpParser();
		parser.push("not json");
		expect(parser.flush()).toEqual([]);
	});
});
