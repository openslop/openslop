// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import Image from "next/image";
import { useMediaSettled } from "../use-media-settled";

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

afterEach(() => {
	act(() => root.unmount());
});

function Probe() {
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const settled = useMediaSettled(image);
	return (
		<Image
			ref={setImage}
			src="https://img/a.png"
			alt=""
			width={1}
			height={1}
			unoptimized
			data-settled={settled}
		/>
	);
}

const image = () => {
	const element = container.querySelector("img");
	if (!element) throw new Error("no image rendered");
	return element;
};

describe("useMediaSettled image", () => {
	it("settles once the image completes", () => {
		root = createRoot(container);
		Object.defineProperty(HTMLImageElement.prototype, "complete", {
			value: false,
			configurable: true,
		});
		act(() => root.render(<Probe />));
		expect(image().dataset.settled).toBe("false");

		Object.defineProperty(image(), "complete", { value: true });
		act(() => image().dispatchEvent(new Event("load")));
		expect(image().dataset.settled).toBe("true");
	});
});
