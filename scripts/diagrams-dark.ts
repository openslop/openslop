import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sum from "lodash/sum";
import zipWith from "lodash/zipWith";

const DOCS = path.join(process.cwd(), "docs");
const LIGHT = "-light.svg";

// Excalidraw's dark theme: invert(93%) then hue-rotate(180deg).
const HUE_ROTATE_180 = [
	[-0.574, 1.43, 0.144],
	[0.426, 0.43, 0.144],
	[0.426, 1.43, -0.856],
];

const toDark = (hex: string) => {
	const inverted = [0, 2, 4].map(
		(i) => 0.93 - (0.86 * parseInt(hex.slice(i, i + 2), 16)) / 255,
	);
	return HUE_ROTATE_180.map((row) => {
		const channel = sum(zipWith(row, inverted, (weight, c) => weight * c));
		const byte = Math.round(Math.min(1, Math.max(0, channel)) * 255);
		return byte.toString(16).padStart(2, "0");
	}).join("");
};

for (const file of readdirSync(DOCS).filter((name) => name.endsWith(LIGHT))) {
	const light = readFileSync(path.join(DOCS, file), "utf8");
	const dark = light.replace(
		/(fill|stroke)="#([0-9a-f]{6})"/gi,
		(_, attribute: string, hex: string) => `${attribute}="#${toDark(hex)}"`,
	);
	const out = file.replace(LIGHT, "-dark.svg");
	writeFileSync(path.join(DOCS, out), dark);
	console.log(`[diagrams-dark] ${file} → ${out}`);
}
