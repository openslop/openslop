import {
	CANVAS_ELEMENT_TYPES,
	type CanvasElementType,
	type ParsedElement,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { makeNodeId } from "./nodeUtils";
import { parseXmlTag } from "./parseXmlTag";
import { createCanvasNode } from "./createCanvasNode";

const MIN_BUFFER_LENGTH = 5;
const TAG_PATTERN = /<([^<>/][^<>]*?)>|<\/([^<>/][^<>]*?)>/g;

/**
 * Incrementally turns a stream of OSML text chunks into canvas nodes. Feed
 * partial chunks with `appendChunk` as they arrive; completed tags are emitted
 * to `getNodes` and open text keeps appending to the last node.
 */
export class OSMLStreamParser {
	private buffer = "";
	private nodes: ParsedElement[] = [];

	appendChunk(chunk: string, connectors: ConnectorRegistry): boolean {
		this.buffer += chunk;
		return this.parseBuffer(connectors);
	}

	getNodes(): ParsedElement[] {
		return this.nodes;
	}

	private parseBuffer(connectors: ConnectorRegistry): boolean {
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
				this.appendNext(tag, attributes, connectors);
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
		lastChild.text += text;
	}

	private appendNext(
		type: string,
		attributes: Record<string, string>,
		connectors: ConnectorRegistry,
	): void {
		if (CANVAS_ELEMENT_TYPES.has(type as CanvasElementType)) {
			const { id, ...attrs } = attributes;
			this.nodes.push(
				createCanvasNode(type as CanvasElementType, connectors, { id, attrs }),
			);
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
	connectors: ConnectorRegistry,
): ParsedElement[] {
	const parser = new OSMLStreamParser();
	parser.appendChunk(`${osml}\n`, connectors);
	return parser.getNodes();
}
