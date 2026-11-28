import { z } from "zod";

export const BridgeCallSchema = z.object({
	id: z.uuid(),
	toolName: z.string(),
	input: z.unknown(),
});

export type BridgeCall = z.infer<typeof BridgeCallSchema>;

export const BridgeOutcomeSchema = z.discriminatedUnion("ok", [
	z.object({ ok: z.literal(true), output: z.unknown() }),
	z.object({ ok: z.literal(false), errorText: z.string() }),
]);

export type BridgeOutcome = z.infer<typeof BridgeOutcomeSchema>;

type Tab = {
	send: (call: BridgeCall) => void;
	pending: Map<string, (outcome: BridgeOutcome) => void>;
};

// Next can load this module once per route, so the open tabs live on the process.
const shared = globalThis as { openslopTabs?: Tab[] };
const tabs = (shared.openslopTabs ??= []);

/** A project tab ready to run tools. The newest one gets the calls; detaching fails whatever it still owes. */
export function attachTab(send: Tab["send"]): () => void {
	const tab: Tab = { send, pending: new Map() };
	tabs.push(tab);
	return () => {
		const at = tabs.indexOf(tab);
		if (at === -1) return;
		tabs.splice(at, 1);
		for (const resolve of tab.pending.values())
			resolve({ ok: false, errorText: "The OpenSlop tab closed mid-call." });
	};
}

export function callTool(
	toolName: string,
	input: unknown,
): Promise<BridgeOutcome> {
	const tab = tabs.at(-1);
	if (!tab)
		return Promise.resolve({
			ok: false,
			errorText: "Open a project in OpenSlop on this computer, then retry.",
		});
	const id = crypto.randomUUID();
	return new Promise((resolve) => {
		tab.pending.set(id, resolve);
		tab.send({ id, toolName, input });
	});
}

export function answer(id: string, outcome: BridgeOutcome) {
	for (const { pending } of tabs) {
		pending.get(id)?.(outcome);
		pending.delete(id);
	}
}
