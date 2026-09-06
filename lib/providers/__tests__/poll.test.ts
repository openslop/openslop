import { describe, expect, it, vi } from "vitest";
import { UnreachableError } from "@/lib/clients/http";
import { awaitCompletion } from "../poll";

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
		const result = await awaitCompletion(poll, "j1", isDone);
		expect(result.status).toBe("completed");
		expect(result.url).toBe("https://x.com/v.mp4");
		expect(poll).toHaveBeenCalledTimes(1);
	});

	it("returns immediately when job has failed", async () => {
		const poll = vi.fn().mockResolvedValue(makeJob("failed"));
		const result = await awaitCompletion(poll, "j1", isDone);
		expect(result.status).toBe("failed");
		expect(poll).toHaveBeenCalledTimes(1);
	});

	it("polls until job completes", async () => {
		const poll = vi
			.fn()
			.mockResolvedValueOnce(makeJob("processing"))
			.mockResolvedValueOnce(makeJob("processing"))
			.mockResolvedValueOnce(makeJob("completed", "https://x.com/done.mp4"));

		const result = await awaitCompletion(poll, "j1", isDone, 10, 5000);
		expect(result.status).toBe("completed");
		expect(poll).toHaveBeenCalledTimes(3);
	});

	it("throws on timeout, whether the server answers or not", async () => {
		const poll = vi.fn().mockResolvedValue(makeJob("processing"));
		await expect(awaitCompletion(poll, "j1", isDone, 10, 50)).rejects.toThrow(
			"timed out",
		);
		poll.mockRejectedValue(new UnreachableError(new TypeError()));
		await expect(awaitCompletion(poll, "j1", isDone, 10, 50)).rejects.toThrow(
			"timed out",
		);
	});

	it("passes jobId to pollFn", async () => {
		const poll = vi.fn().mockResolvedValue(makeJob("completed"));
		await awaitCompletion(poll, "my-job-id", isDone);
		expect(poll).toHaveBeenCalledWith("my-job-id");
	});

	it("propagates errors the server answered with", async () => {
		const poll = vi.fn().mockRejectedValue(new Error("404 Not Found"));
		await expect(awaitCompletion(poll, "j1", isDone)).rejects.toThrow(
			"404 Not Found",
		);
		expect(poll).toHaveBeenCalledTimes(1);
	});

	it("keeps polling when a request never reaches the server", async () => {
		const poll = vi
			.fn()
			.mockRejectedValueOnce(new UnreachableError(new TypeError()))
			.mockResolvedValueOnce(makeJob("completed"));
		const result = await awaitCompletion(poll, "j1", isDone, 10, 5000);
		expect(result.status).toBe("completed");
		expect(poll).toHaveBeenCalledTimes(2);
	});
});
