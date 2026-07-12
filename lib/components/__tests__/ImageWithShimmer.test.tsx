// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImageWithShimmer } from "../ImageWithShimmer";

const shimmer = (container: HTMLElement) =>
	container.querySelector(".shimmer-surface");

const getImg = (container: HTMLElement): HTMLImageElement => {
	const img = container.querySelector("img");
	if (!img) throw new Error("no <img> rendered");
	return img;
};

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("ImageWithShimmer (unoptimized)", () => {
	it("renders a plain <img> that forwards standard props and strips next-only ones", () => {
		const { container } = render(
			<ImageWithShimmer
				unoptimized
				fill
				src="https://example.com/a.png"
				alt="alt text"
				loading="lazy"
				crossOrigin="anonymous"
				quality={90}
				placeholder="blur"
				blurDataURL="data:image/png;base64,xyz"
			/>,
		);
		const img = container.querySelector("img");
		expect(img).not.toBeNull();
		expect(img?.getAttribute("src")).toBe("https://example.com/a.png");
		expect(img?.getAttribute("alt")).toBe("alt text");
		expect(img?.getAttribute("loading")).toBe("lazy");
		expect(img?.getAttribute("crossorigin")).toBe("anonymous");
		// `fill` is emulated with positioning classes on the plain <img>
		expect(img?.className).toContain("absolute");
		for (const stripped of ["quality", "placeholder", "blurdataurl"]) {
			expect(img?.hasAttribute(stripped)).toBe(false);
		}
	});

	it("shows the shimmer until the image fires load", () => {
		const { container } = render(
			<ImageWithShimmer unoptimized src="https://example.com/a.png" alt="" />,
		);
		expect(shimmer(container)).not.toBeNull();

		fireEvent.load(getImg(container));
		expect(shimmer(container)).toBeNull();
	});

	it("hides the shimmer on mount when the image is already complete (cached)", () => {
		// A cached image can be complete before React attaches onLoad, so the
		// load event never arrives.
		vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(
			true,
		);
		const { container } = render(
			<ImageWithShimmer
				unoptimized
				src="https://example.com/cached.png"
				alt=""
			/>,
		);
		expect(shimmer(container)).toBeNull();
	});

	it("re-shows the shimmer when src swaps in place, then clears on the new load", () => {
		const { container, rerender } = render(
			<ImageWithShimmer unoptimized src="https://example.com/a.png" alt="" />,
		);
		fireEvent.load(getImg(container));
		expect(shimmer(container)).toBeNull();

		rerender(
			<ImageWithShimmer unoptimized src="https://example.com/b.png" alt="" />,
		);
		expect(shimmer(container)).not.toBeNull();

		fireEvent.load(getImg(container));
		expect(shimmer(container)).toBeNull();
	});
});
