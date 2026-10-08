import { isElementType } from "./guards";
import { parseXmlTag } from "./parseXmlTag";
import type { ConnectorModels } from "@/lib/connectors/models";
import { createCanvasElement } from "./createCanvasElement";
import type { CanvasElement } from "./types";
import { unescapeXml } from "./xmlEscape";

const MIN_BUFFER_LENGTH = 5;
const TAG_PATTERN = /<([^<>/][^<>]*?)>|<\/([^<>/][^<>]*?)>/g;
// A chunk can end mid-entity ("&am"); flushing it would decode the two halves
// separately and lose the character.
const PARTIAL_ENTITY = /&[a-z]*$/i;

/**
 * Incrementally turns a stream of OSML text chunks into canvas nodes. Feed
 * partial chunks with `appendChunk` as they arrive; completed tags are emitted
 * to `getNodes` and open text keeps appending to the last node. A tag the
 * canvas does not know is dropped along with its text.
 */
export class OSMLStreamParser {
	private buffer = "";
	private nodes: CanvasElement[] = [];
	private current: CanvasElement | undefined;

	appendChunk(chunk: string, defaultModels?: ConnectorModels): boolean {
		this.buffer += chunk;
		return this.parseBuffer(defaultModels);
	}

	getNodes(): CanvasElement[] {
		return this.nodes;
	}

	private parseBuffer(defaultModels?: ConnectorModels): boolean {
		TAG_PATTERN.lastIndex = 0;

		if (this.shouldFlushBuffer()) {
			this.updateCurrent(this.buffer);
			this.buffer = "";
			return true;
		}

		let lastIndex = 0;
		let match: RegExpExecArray | null = null;
		let updated = false;

		while ((match = TAG_PATTERN.exec(this.buffer)) !== null) {
			const text = this.buffer.slice(lastIndex, match.index);
			if (text.trim()) {
				this.updateCurrent(text);
				updated = true;
			}

			const openTag = match[1];
			if (openTag) {
				const { tag, attributes } = parseXmlTag(openTag);
				this.appendNext(tag, attributes, defaultModels);
			}
			lastIndex = match.index + match[0].length;
		}

		this.buffer = this.buffer.slice(lastIndex);
		return updated;
	}

	private updateCurrent(text: string): void {
		const lastChild = this.current?.children.at(-1);
		if (!lastChild) return;
		lastChild.text += unescapeXml(text);
	}

	private appendNext(
		type: string,
		attributes: Record<string, string>,
		defaultModels?: ConnectorModels,
	): void {
		if (!isElementType(type)) {
			this.current = undefined;
			return;
		}
		const { id, ...attrs } = attributes;
		const element = createCanvasElement(type, { id, attrs, defaultModels });
		this.nodes.push(element);
		this.current = element;
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

// TODO store and rehydrate element-scoped connector snapshot too
/**
 * One-shot parse of a complete OSML string into canvas nodes.
 */
export function parseOSML(
	osml: string,
	defaultModels?: ConnectorModels,
): CanvasElement[] {
	const parser = new OSMLStreamParser();
	parser.appendChunk(`${osml}\n`, defaultModels);
	return parser.getNodes();
}
