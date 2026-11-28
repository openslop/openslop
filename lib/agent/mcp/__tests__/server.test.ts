import { afterEach, expect, it } from "vitest";
import { answer, attachTab } from "../relay";
import { handleMcp } from "../server";

let detach = () => {};
afterEach(() => detach());

const rpc = async (method: string, params: object = {}) => {
	const response = await handleMcp(
		new Request("http://localhost:3000/api/local/mcp", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				accept: "application/json, text/event-stream",
			},
			body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
		}),
	);
	return (await response.json()).result;
};

it("lists Sloppy's tools with their input schemas", async () => {
	const { tools } = await rpc("tools/list");
	expect(tools.map(({ name }: { name: string }) => name)).toContain(
		"read_title",
	);
	expect(tools[0].inputSchema.type).toBe("object");
});

it("runs a call in the open tab and hands back its output", async () => {
	detach = attachTab((call) =>
		answer(call.id, { ok: true, output: { title: "Rain Cat" } }),
	);
	expect(
		await rpc("tools/call", { name: "read_title", arguments: {} }),
	).toEqual({ content: [{ type: "text", text: '{"title":"Rain Cat"}' }] });
});

it("reports a failed call as a tool error", async () => {
	expect(
		await rpc("tools/call", { name: "read_title", arguments: {} }),
	).toMatchObject({ isError: true });
});
