import type { SupabaseClient } from "@supabase/supabase-js";
import {
	agentChannel,
	ANSWER,
	BridgeAnswerSchema,
	CALL,
	newestTab,
	type BridgeOutcome,
	type TabPresence,
} from "./bridge";

const ANSWER_WAIT_MS = 240_000;

/** Runs each call in the user's newest open project tab and waits for its answer. */
export const callTab =
	(supabase: SupabaseClient, userId: string) =>
	(toolName: string, input: unknown) =>
		new Promise<BridgeOutcome>((resolve, reject) => {
			const id = crypto.randomUUID();
			const channel = supabase.channel(agentChannel(userId), {
				config: { private: true },
			});
			const settle = (finish: () => void) => {
				clearTimeout(timer);
				void supabase.removeChannel(channel);
				finish();
			};
			const answer = (outcome: BridgeOutcome) => settle(() => resolve(outcome));
			const timer = setTimeout(
				() =>
					answer({
						ok: false,
						errorText:
							"The OpenSlop tab did not answer in time. Keep a project open in OpenSlop, then retry.",
					}),
				ANSWER_WAIT_MS,
			);
			let asked = false;
			channel
				.on("presence", { event: "sync" }, () => {
					if (asked) return;
					asked = true;
					if (!newestTab(channel.presenceState<TabPresence>()))
						return answer({
							ok: false,
							errorText: "Open a project in OpenSlop, then retry.",
						});
					void channel.send({
						type: "broadcast",
						event: CALL,
						payload: { id, toolName, input },
					});
				})
				.on("broadcast", { event: ANSWER }, ({ payload }) => {
					const reply = BridgeAnswerSchema.parse(payload);
					if (reply.id === id) answer(reply.outcome);
				})
				.subscribe((status, error) => {
					if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
						settle(() =>
							reject(
								error ??
									new Error(
										`Couldn't reach your OpenSlop tab (${status}). Retry in a moment.`,
									),
							),
						);
				});
		});
