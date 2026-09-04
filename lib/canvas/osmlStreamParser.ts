import type { ParsedElement } from "@/lib/canvas/types";
import { isCanvasElementType } from "@/lib/canvas/guards";
import { makeNodeId } from "./nodeUtils";
import { parseXmlTag } from "./parseXmlTag";
import type { ConnectorModels } from "@/lib/connectors/models";
import { createCanvasNode } from "./createCanvasNode";
import { unescapeXml } from "./xmlEscape";

const MIN_BUFFER_LENGTH = 5;
const TAG_PATTERN = /<([^<>/][^<>]*?)>|<\/([^<>/][^<>]*?)>/g;
// A chunk can end mid-entity ("&am"); flushing it would decode the two halves
// separately and lose the character.
const PARTIAL_ENTITY = /&[a-z]*$/i;

/**
 * Incrementally turns a stream of OSML text chunks into canvas nodes. Feed
 * partial chunks with `appendChunk` as they arrive; completed tags are emitted
 * to `getNodes` and open text keeps appending to the last node.
 */
export class OSMLStreamParser {
	private buffer = "";
	private nodes: ParsedElement[] = [];

	appendChunk(chunk: string, defaultModels?: ConnectorModels): boolean {
		this.buffer += chunk;
		return this.parseBuffer(defaultModels);
	}

	getNodes(): ParsedElement[] {
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
		const current = this.nodes[this.nodes.length - 1];
		if (!current) return;
		const lastChild = current.children[current.children.length - 1];
		if (!lastChild) return;
		lastChild.text += unescapeXml(text);
	}

	private appendNext(
		type: string,
		attributes: Record<string, string>,
		defaultModels?: ConnectorModels,
	): void {
		if (isCanvasElementType(type)) {
			const { id, ...attrs } = attributes;
			this.nodes.push(createCanvasNode(type, { id, attrs, defaultModels }));
			return;
		}
		// Non-canvas tags (metadata_*) pass through as generic nodes; the
		// metadata sync layer reads them by tag name.
		this.nodes.push({
			id: makeNodeId(),
			type,
			customAttributes: attributes,
			children: [{ id: makeNodeId(), type, text: "" }],
		});
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
): ParsedElement[] {
	const parser = new OSMLStreamParser();
	parser.appendChunk(`${osml}\n`, defaultModels);
	return parser.getNodes();
}
