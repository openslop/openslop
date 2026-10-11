import type { ConnectorModels } from "@/lib/connectors/models";
import { createCanvasElement } from "./create-canvas-element";
import { isElementType } from "./guards";
import { makeNodeId } from "./node-utils";
import { parseXmlTag } from "./parse-xml-tag";
import type { CanvasElement, ElementType } from "./types";
import { unescapeXml } from "./xml-escape";

const MIN_BUFFER_LENGTH = 5;
const TAG_PATTERN = /<(\/?)([^<>/][^<>]*?)>/g;
// A chunk can end mid-entity ("&am"); flushing it would decode the two halves
// separately and lose the character.
const PARTIAL_ENTITY = /&[a-z]*$/i;

/** An element as its OSML states it. While the stream is open, `text` keeps growing. */
export type OSMLElement<T extends ElementType = ElementType> = {
	id: string;
	type: T;
	attrs: Record<string, string>;
	text: string;
};

/**
 * Incrementally reads a stream of OSML text. Each `appendChunk` returns the
 * elements that chunk opened or added text to, in document order. A tag the
 * canvas does not know is dropped along with its text.
 */
export class OSMLStreamParser {
	private buffer = "";
	private current: OSMLElement | undefined;
	private changed = new Set<OSMLElement>();

	appendChunk(chunk: string): OSMLElement[] {
		this.buffer += chunk;
		this.changed = new Set();
		if (this.shouldFlushBuffer()) {
			this.grow(this.buffer);
			this.buffer = "";
		} else {
			this.parseTags();
		}
		return [...this.changed];
	}

	private parseTags(): void {
		let lastIndex = 0;
		for (const match of this.buffer.matchAll(TAG_PATTERN)) {
			const [matched, closing, openTag] = match;
			const text = this.buffer.slice(lastIndex, match.index);
			if (text.trim()) this.grow(text);
			if (!closing) this.open(openTag);
			lastIndex = match.index + matched.length;
		}
		this.buffer = this.buffer.slice(lastIndex);
	}

	private grow(text: string): void {
		if (!this.current) return;
		this.current.text += unescapeXml(text);
		this.changed.add(this.current);
	}

	private open(openTag: string): void {
		const { tag, attributes } = parseXmlTag(openTag);
		if (!isElementType(tag)) {
			this.current = undefined;
			return;
		}
		const { id = makeNodeId(), ...attrs } = attributes;
		this.current = { id, type: tag, attrs, text: "" };
		this.changed.add(this.current);
	}

	private shouldFlushBuffer(): boolean {
		return (
			!this.buffer.includes("<") &&
			!this.buffer.includes(">") &&
			!PARTIAL_ENTITY.test(this.buffer) &&
			this.buffer.length >= MIN_BUFFER_LENGTH
		);
	}
}

/** One-shot parse of a complete OSML string into canvas elements. */
export function parseOSML(
	osml: string,
	defaultModels?: ConnectorModels,
): CanvasElement[] {
	return new OSMLStreamParser()
		.appendChunk(osml)
		.map(({ id, type, attrs, text }) =>
			createCanvasElement(type, { id, attrs, text, defaultModels }),
		);
}
