import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";

const { updateUser } = vi.hoisted(() => ({
	updateUser: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
	createClient: () => ({ auth: { updateUser } }),
}));

import { createAccountStore } from "../accountStore";

type UpdateResult = { error: { message: string } | null };

type Deferred<T = UpdateResult> = {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
};

function deferred<T = UpdateResult>(): Deferred<T> {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

/** The shape `persistModels` destructures `{ error }` from. */
const ok = (): UpdateResult => ({ error: null });

/** Drain pending microtasks; p-queue advances between tasks on microtasks. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const ref = (provider: ModelRef["provider"], model: string): ModelRef => ({
	provider,
	model,
});

const llm = ref("anthropic", "claude-opus");
const tts = ref("elevenlabs", "multilingual-v2");
const sfx = ref("elevenlabs", "sfx-v1");

/** The payload `persistModels` sends to `auth.updateUser`. */
const payload = (models: ConnectorModels) => ({ data: { models } });

const store = (models: ConnectorModels = {}) =>
	createAccountStore({ models, providerKeys: [] });

beforeEach(() => {
	updateUser.mockReset();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("createAccountStore model defaults", () => {
	describe("overlapping mutations are serialized", () => {
		it("keeps both picks when two setModels overlap (Shape A: stale snapshot)", async () => {
			const s = store();
			const first = deferred();
			const second = deferred();
			updateUser
				.mockImplementationOnce(() => first.promise)
				.mockImplementationOnce(() => second.promise);

			const a = s.getState().setModels({ llm });
			const b = s.getState().setModels({ tts });

			// The second pick has not reached the network: it is queued behind the
			// first persist. Before the fix, both `updateUser` calls fired at once.
			expect(updateUser).toHaveBeenCalledTimes(1);
			expect(updateUser).toHaveBeenLastCalledWith(payload({ llm }));

			first.resolve(ok());
			await flush();

			// Now the second pick runs, computed from the post-first snapshot.
			expect(updateUser).toHaveBeenCalledTimes(2);
			expect(updateUser).toHaveBeenLastCalledWith(payload({ llm, tts }));

			second.resolve(ok());
			await Promise.all([a, b]);

			expect(s.getState().models).toEqual({ llm, tts });
			expect(updateUser.mock.calls).toEqual([
				[payload({ llm })],
				[payload({ llm, tts })],
			]);
		});

		it("is immune to network resolve order — the second persist starts only after the first settles", async () => {
			const s = store();
			const first = deferred();
			const second = deferred();
			updateUser
				.mockImplementationOnce(() => first.promise)
				.mockImplementationOnce(() => second.promise);

			const a = s.getState().setModels({ llm });
			const b = s.getState().setModels({ tts });

			// There is no second in-flight call to resolve out of order: the queue
			// holds it until the first completes, so "LIFO" cannot occur.
			expect(updateUser).toHaveBeenCalledTimes(1);

			// Resolve the first only; the second is still parked.
			first.resolve(ok());
			await flush();

			second.resolve(ok());
			await Promise.all([a, b]);

			// Outcome and persist order follow click order, not network order.
			expect(s.getState().models).toEqual({ llm, tts });
			expect(updateUser.mock.calls).toEqual([
				[payload({ llm })],
				[payload({ llm, tts })],
			]);
		});

		it("reset after a pick wins (Shape B: click order, not resolve order)", async () => {
			const s = store();
			const first = deferred();
			const second = deferred();
			updateUser
				.mockImplementationOnce(() => first.promise)
				.mockImplementationOnce(() => second.promise);

			const a = s.getState().setModels({ llm });
			const b = s.getState().resetModels();

			expect(updateUser).toHaveBeenCalledTimes(1);

			first.resolve(ok());
			await flush();

			// Reset ran after the pick, so it carries {} forward.
			expect(updateUser).toHaveBeenLastCalledWith(payload({}));

			second.resolve(ok());
			await Promise.all([a, b]);

			expect(s.getState().models).toEqual({});
			expect(updateUser.mock.calls).toEqual([
				[payload({ llm })],
				[payload({})],
			]);
		});

		it("a pick after a reset wins (Shape B, reversed click order)", async () => {
			const s = store({ llm, tts });
			const first = deferred();
			const second = deferred();
			updateUser
				.mockImplementationOnce(() => first.promise)
				.mockImplementationOnce(() => second.promise);

			const a = s.getState().resetModels();
			const b = s.getState().setModels({ sfx });

			first.resolve(ok());
			await flush();

			second.resolve(ok());
			await Promise.all([a, b]);

			expect(s.getState().models).toEqual({ sfx });
			expect(updateUser.mock.calls).toEqual([
				[payload({})],
				[payload({ sfx })],
			]);
		});

		it("a third pick queued behind a slow first sees both earlier sets", async () => {
			const s = store();
			const d1 = deferred();
			const d2 = deferred();
			const d3 = deferred();
			updateUser
				.mockImplementationOnce(() => d1.promise)
				.mockImplementationOnce(() => d2.promise)
				.mockImplementationOnce(() => d3.promise);

			const a = s.getState().setModels({ llm });
			const b = s.getState().setModels({ tts });
			const c = s.getState().setModels({ sfx });

			expect(updateUser).toHaveBeenCalledTimes(1);

			d1.resolve(ok());
			await flush();
			expect(updateUser).toHaveBeenLastCalledWith(payload({ llm, tts }));

			d2.resolve(ok());
			await flush();
			expect(updateUser).toHaveBeenLastCalledWith(payload({ llm, tts, sfx }));

			d3.resolve(ok());
			await Promise.all([a, b, c]);

			expect(s.getState().models).toEqual({ llm, tts, sfx });
			expect(updateUser.mock.calls).toEqual([
				[payload({ llm })],
				[payload({ llm, tts })],
				[payload({ llm, tts, sfx })],
			]);
		});

		it("keeps serving later mutations after a persist rejects (no queue poisoning)", async () => {
			const s = store();
			const first = deferred();
			const second = deferred();
			updateUser
				.mockImplementationOnce(() => first.promise)
				.mockImplementationOnce(() => second.promise);

			const a = s.getState().setModels({ llm });
			const b = s.getState().setModels({ tts });
			// Handle the rejection eagerly so it is never momentarily unhandled
			// between the persist-resolve microtask and the assertion below.
			a.catch(() => {});

			expect(updateUser).toHaveBeenCalledTimes(1);

			first.resolve({ error: { message: "boom" } });
			await flush();

			// The failed first call rejects; the store is unchanged (no set ran),
			// and the second call has started but is parked on its own persist.
			await expect(a).rejects.toThrow("Failed to save defaults: boom");
			expect(s.getState().models).toEqual({});
			expect(updateUser).toHaveBeenCalledTimes(2);
			expect(updateUser).toHaveBeenLastCalledWith(payload({ tts }));

			// The queue is not poisoned: releasing the second persist lands it.
			second.resolve(ok());
			await b;
			expect(s.getState().models).toEqual({ tts });
			expect(updateUser.mock.calls).toEqual([
				[payload({ llm })],
				[payload({ tts })],
			]);
		});
	});

	describe("happy paths (no overlap)", () => {
		it("merges a patch onto the current defaults and persists it", async () => {
			const s = store({ llm });
			updateUser.mockResolvedValueOnce(ok());

			await s.getState().setModels({ tts });

			expect(s.getState().models).toEqual({ llm, tts });
			expect(updateUser).toHaveBeenCalledWith(payload({ llm, tts }));
		});

		it("resetModels persists and stores {}", async () => {
			const s = store({ llm, tts });
			updateUser.mockResolvedValueOnce(ok());

			await s.getState().resetModels();

			expect(s.getState().models).toEqual({});
			expect(updateUser).toHaveBeenCalledWith(payload({}));
		});

		it("setModels on an empty store persists the pick", async () => {
			const s = store();
			updateUser.mockResolvedValueOnce(ok());

			await s.getState().setModels({ llm });

			expect(s.getState().models).toEqual({ llm });
			expect(updateUser).toHaveBeenCalledWith(payload({ llm }));
		});

		it("a second awaited setModels sees the first pick", async () => {
			const s = store();
			updateUser.mockResolvedValue(ok());

			await s.getState().setModels({ llm });
			await s.getState().setModels({ tts });

			expect(s.getState().models).toEqual({ llm, tts });
			expect(updateUser.mock.calls).toEqual([
				[payload({ llm })],
				[payload({ llm, tts })],
			]);
		});
	});

	describe("error handling", () => {
		it("does not update the store when the persist errors", async () => {
			const s = store({ llm });
			updateUser.mockResolvedValueOnce({ error: { message: "nope" } });

			await expect(s.getState().setModels({ tts })).rejects.toThrow(
				"Failed to save defaults: nope",
			);

			expect(s.getState().models).toEqual({ llm });
			expect(updateUser).toHaveBeenCalledTimes(1);
		});

		it("rejects resetModels when the persist errors and leaves the store intact", async () => {
			const s = store({ llm });
			updateUser.mockResolvedValueOnce({ error: { message: "down" } });

			await expect(s.getState().resetModels()).rejects.toThrow(
				"Failed to save defaults: down",
			);

			expect(s.getState().models).toEqual({ llm });
		});
	});

	describe("a sequence of overlapping and serial calls", () => {
		it("ends with the store matching the last persisted payload, in click order", async () => {
			const s = store();
			updateUser.mockResolvedValue(ok());

			await s.getState().setModels({ llm });
			await s.getState().setModels({ tts });
			await s.getState().resetModels();
			await s.getState().setModels({ sfx });

			expect(s.getState().models).toEqual({ sfx });
			expect(updateUser.mock.calls).toEqual([
				[payload({ llm })],
				[payload({ llm, tts })],
				[payload({})],
				[payload({ sfx })],
			]);
		});
	});
});
