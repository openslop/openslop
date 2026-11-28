import { afterEach, expect, it, vi } from "vitest";
import { answer, attachTab, callTool, type BridgeCall } from "../relay";

const detachers: (() => void)[] = [];
const attach = (send: (call: BridgeCall) => void) => {
	const detach = attachTab(send);
	detachers.push(detach);
	return detach;
};

afterEach(() => detachers.splice(0).forEach((detach) => detach()));

it("asks for an open project when no tab listens", async () => {
	expect(await callTool("read_title", {})).toEqual({
		ok: false,
		errorText: "Open a project in OpenSlop on this computer, then retry.",
	});
});

it("sends each call to the newest tab and settles it with that tab's answer", async () => {
	const older = vi.fn();
	attach(older);
	attach((call) =>
		answer(call.id, { ok: true, output: { title: "Rain Cat" } }),
	);
	expect(await callTool("read_title", {})).toEqual({
		ok: true,
		output: { title: "Rain Cat" },
	});
	expect(older).not.toHaveBeenCalled();
});

it("fails a call when its tab closes before answering", async () => {
	const detach = attach(() => {});
	const pending = callTool("read_title", {});
	detach();
	expect(await pending).toEqual({
		ok: false,
		errorText: "The OpenSlop tab closed mid-call.",
	});
});

it("detaches a tab once, however often it is told to", async () => {
	const detach = attach(() => {});
	attach((call) => answer(call.id, { ok: true, output: "newest" }));
	detach();
	detach();
	expect(await callTool("read_title", {})).toEqual({
		ok: true,
		output: "newest",
	});
});
