import { beforeEach, describe, expect, it } from "vitest";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { DEFAULT_ASPECT_RATIO } from "../aspectRatio";
import { DEFAULT_TRANSITION } from "../transitions";
import { setAspectRatio } from "../useAspectRatio";
import { setTransitionType } from "../useTransitionType";

const PROJECT_ID = "video-settings-test";

const settings = () =>
	getProjectStore(PROJECT_ID).getState().metadata.videoSettings;

describe("video settings writers", () => {
	beforeEach(() => clearProjectStore(PROJECT_ID));

	it("writes the aspect ratio into videoSettings", () => {
		setAspectRatio(PROJECT_ID, "9:16");
		expect(settings()?.aspectRatio).toBe("9:16");
	});

	it("writes the transition type into videoSettings", () => {
		setTransitionType(PROJECT_ID, "fade");
		expect(settings()?.transitionType).toBe("fade");
	});

	it("does not clobber a sibling setting", () => {
		setAspectRatio(PROJECT_ID, "9:16");
		setTransitionType(PROJECT_ID, "wipe");
		expect(settings()).toEqual({ aspectRatio: "9:16", transitionType: "wipe" });
	});

	it("leaves defaults untouched until written", () => {
		expect(settings()?.aspectRatio ?? DEFAULT_ASPECT_RATIO).toBe(
			DEFAULT_ASPECT_RATIO,
		);
		expect(settings()?.transitionType ?? DEFAULT_TRANSITION).toBe(
			DEFAULT_TRANSITION,
		);
	});
});
