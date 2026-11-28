import { expect, it, vi } from "vitest";
import type { BridgeOutcome } from "../bridge";
import { handleMcp } from "../server";

const rpc = async (
	method: string,
	params: object = {},
	outcome: BridgeOutcome = { ok: true, output: null },
) => {
	const callTool = vi.fn(async () => outcome);
	const response = await handleMcp(
		new Request("http://localhost:3000/api/mcp", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				accept: "application/json, text/event-stream",
			},
			body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
		}),
		callTool,
	);
	return { result: (await response.json()).result, callTool };
};

it("lists Sloppy's tools with their input schemas", async () => {
	const { result } = await rpc("tools/list");
	expect(result.tools.map(({ name }: { name: string }) => name)).toContain(
		"read_title",
	);
	expect(result.tools[0].inputSchema.type).toBe("object");
});

it("hands a call to the tab and returns its output as text", async () => {
	const { result, callTool } = await rpc(
		"tools/call",
		{ name: "read_title", arguments: {} },
		{ ok: true, output: { title: "Rain Cat" } },
	);
	expect(callTool).toHaveBeenCalledWith("read_title", {});
	expect(result).toEqual({
		content: [{ type: "text", text: '{"title":"Rain Cat"}' }],
	});
});

it("reports a failed call as a tool error", async () => {
	const { result } = await rpc(
		"tools/call",
		{ name: "read_title", arguments: {} },
		{ ok: false, errorText: "Open a project in OpenSlop, then retry." },
	);
	expect(result).toEqual({
		isError: true,
		content: [
			{ type: "text", text: "Open a project in OpenSlop, then retry." },
		],
	});
});
