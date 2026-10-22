import { describe, expect, it, vi } from "vitest";
import { UnreachableError } from "@/lib/clients/http";
import { awaitCompletion, pollUpdates } from "../poll";

type Job = { status: string; url?: string };

function makeJob(status: string, url?: string): Job {
	return { status, url };
}

const isDone = (j: Job) => j.status === "completed" || j.status === "failed";

describe("awaitCompletion", () => {
	it("returns immediately when job is already completed", async () => {
		const poll = vi
			.fn()
			.mockResolvedValue(makeJob("completed", "https://x.com/v.mp4"));
		const result = await awaitCompletion(poll, isDone);
		expect(result.status).toBe("completed");
		expect(result.url).toBe("https://x.com/v.mp4");
		expect(poll).toHaveBeenCalledTimes(1);
	});

	it("returns immediately when job has failed", async () => {
		const poll = vi.fn().mockResolvedValue(makeJob("failed"));
		const result = await awaitCompletion(poll, isDone);
		expect(result.status).toBe("failed");
		expect(poll).toHaveBeenCalledTimes(1);
	});

	it("polls until job completes", async () => {
		const poll = vi
			.fn()
			.mockResolvedValueOnce(makeJob("processing"))
			.mockResolvedValueOnce(makeJob("processing"))
			.mockResolvedValueOnce(makeJob("completed", "https://x.com/done.mp4"));

		const result = await awaitCompletion(poll, isDone, 10);
		expect(result.status).toBe("completed");
		expect(poll).toHaveBeenCalledTimes(3);
	});

	it("gives up when the server stays unreachable", async () => {
		const poll = vi
			.fn()
			.mockRejectedValue(new UnreachableError(new TypeError()));
		await expect(awaitCompletion(poll, isDone, 0)).rejects.toThrow(
			UnreachableError,
		);
		expect(poll).toHaveBeenCalledTimes(24);
	});

	it("resets the unreachable count once the server answers", async () => {
		const unreachable = new UnreachableError(new TypeError());
		const poll = vi.fn();
		for (let i = 0; i < 23; i++) poll.mockRejectedValueOnce(unreachable);
		poll.mockResolvedValueOnce(makeJob("processing"));
		for (let i = 0; i < 23; i++) poll.mockRejectedValueOnce(unreachable);
		poll.mockResolvedValueOnce(makeJob("completed"));

		const result = await awaitCompletion(poll, isDone, 0);
		expect(result.status).toBe("completed");
		expect(poll).toHaveBeenCalledTimes(48);
	});

	it("propagates errors the server answered with", async () => {
		const poll = vi.fn().mockRejectedValue(new Error("404 Not Found"));
		await expect(awaitCompletion(poll, isDone)).rejects.toThrow(
			"404 Not Found",
		);
		expect(poll).toHaveBeenCalledTimes(1);
	});

	it("keeps polling when a request never reaches the server", async () => {
		const poll = vi
			.fn()
			.mockRejectedValueOnce(new UnreachableError(new TypeError()))
			.mockResolvedValueOnce(makeJob("completed"));
		const result = await awaitCompletion(poll, isDone, 10);
		expect(result.status).toBe("completed");
		expect(poll).toHaveBeenCalledTimes(2);
	});
});

describe("pollUpdates", () => {
	it("yields every answer, skipping the requests that never arrived", async () => {
		const poll = vi
			.fn<() => Promise<Job>>()
			.mockResolvedValueOnce(makeJob("processing"))
			.mockRejectedValueOnce(new UnreachableError(new TypeError()))
			.mockResolvedValueOnce(makeJob("completed"));
		const seen: Job[] = [];
		for await (const job of pollUpdates(poll, 0)) {
			seen.push(job);
			if (job.status === "completed") break;
		}
		expect(seen.map((job) => job.status)).toEqual(["processing", "completed"]);
		expect(poll).toHaveBeenCalledTimes(3);
	});
});
