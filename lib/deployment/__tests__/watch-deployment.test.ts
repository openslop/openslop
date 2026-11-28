// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createDeploymentCheck,
	DEPLOYMENT_CHECK_INTERVAL_MS,
	whileVisible,
} from "../watch-deployment";

describe("createDeploymentCheck", () => {
	const onNewDeployment = vi.fn();
	const checking = (...served: (string | null)[]) => {
		const latest = vi.fn<() => Promise<string | null>>();
		for (const id of served) latest.mockResolvedValueOnce(id);
		return createDeploymentCheck({ own: "dpl-1", latest, onNewDeployment });
	};

	it("stays quiet while the server runs this tab's deployment", async () => {
		const check = checking("dpl-1");
		await check();
		expect(onNewDeployment).not.toHaveBeenCalled();
	});

	it("reports a newer deployment once, however often it is seen", async () => {
		const check = checking("dpl-2", "dpl-2", "dpl-2");
		await check();
		await check();
		await check();
		expect(onNewDeployment).toHaveBeenCalledOnce();
	});

	it("reports the next deployment too", async () => {
		const check = checking("dpl-2", "dpl-3");
		await check();
		await check();
		expect(onNewDeployment).toHaveBeenCalledTimes(2);
	});
});

describe("whileVisible", () => {
	const check = vi.fn();
	let visibility: DocumentVisibilityState;
	let stop: () => void;

	const show = (state: DocumentVisibilityState) => {
		visibility = state;
		document.dispatchEvent(new Event("visibilitychange"));
	};

	beforeEach(() => {
		vi.useFakeTimers();
		visibility = "visible";
		vi.spyOn(document, "visibilityState", "get").mockImplementation(
			() => visibility,
		);
		stop = whileVisible(check);
	});

	afterEach(() => {
		stop();
		vi.useRealTimers();
	});

	it("checks when the tab comes back into view, not when it leaves", () => {
		show("hidden");
		expect(check).not.toHaveBeenCalled();
		show("visible");
		expect(check).toHaveBeenCalledOnce();
	});

	it("checks on each interval while in view", () => {
		vi.advanceTimersByTime(DEPLOYMENT_CHECK_INTERVAL_MS * 2);
		expect(check).toHaveBeenCalledTimes(2);
	});

	it("skips the interval while the tab is hidden", () => {
		show("hidden");
		vi.advanceTimersByTime(DEPLOYMENT_CHECK_INTERVAL_MS * 3);
		expect(check).not.toHaveBeenCalled();
	});

	it("stops checking once stopped", () => {
		stop();
		show("visible");
		vi.advanceTimersByTime(DEPLOYMENT_CHECK_INTERVAL_MS);
		expect(check).not.toHaveBeenCalled();
	});
});
