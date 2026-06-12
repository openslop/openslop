import { Descendant } from "slate";
import {
	CANVAS_ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
	type ParsedElement,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getContentElements, isSceneElement } from "@/lib/canvas/scenes";
import { makeNodeId } from "./nodeUtils";
import { parseXmlTag } from "./parseXmlTag";
import { createCanvasNode } from "./createCanvasNode";

const MIN_BUFFER_LENGTH = 5;
const TAG_PATTERN = /<([^<>/][^<>]*?)>|<\/([^<>/][^<>]*?)>/g;

export const SCENE_MARKER_PATTERN = /^---\s*Scene\s+\d+\s*---\s*$/m;
const sceneMarker = (n: number) => `\n--- Scene ${n} ---\n`;

export class OSMLSerializer {
	private buffer = "";
	private nodes: ParsedElement[] = [];

	static serialize(descendants: Descendant[]): string {
		return getContentElements(descendants)
			.map(OSMLSerializer.serializeElement)
			.join("")
			.trim();
	}

	static serializeWithScenes(descendants: Descendant[]): string {
		let osml = "";
		let sceneNum = 0;
		for (const node of descendants) {
			if (isSceneElement(node)) {
				sceneNum++;
				osml += sceneMarker(sceneNum);
				for (const child of node.children) {
					osml += OSMLSerializer.serializeElement(child);
				}
			}
		}
		return osml.trim();
	}

	private static serializeElement(element: CanvasContentElement): string {
		const content = OSMLSerializer.getTextContent(element);
		const tagName = element.type;
		const attributes = element.customAttributes ?? {};
		const attrString = Object.entries({ id: element.id, ...attributes })
			.map(([key, value]) => ` ${key}="${value}"`)
			.join("");
		return `<${tagName}${attrString}>${content}</${tagName}>\n`;
	}

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
				const { tag, ...attributes } = parseXmlTag(openTag);
				this.appendNext(tag, attributes, connectors);
			}
			lastIndex = match.index + match[0].length;
		}

		this.buffer = this.buffer.slice(lastIndex);
		return updated;
	}

	private updateCurrent(text: string | undefined): void {
		const current = this.nodes[this.nodes.length - 1];
		if (!current) {
			return;
		}
		const lastChild = current.children[current.children.length - 1];
		if (!lastChild) return;
		lastChild.text += text ?? "";
	}

	private appendNext(
		type: string,
		attributes: Record<string, string>,
		connectors: ConnectorRegistry,
	): void {
		if (CANVAS_ELEMENT_TYPES.has(type as CanvasElementType)) {
			const { id, ...attrs } = attributes;
			this.nodes.push(
				createCanvasNode(type as CanvasElementType, connectors, {
					id,
					attrs,
				}),
			);
			return;
		}
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

	static getTextContent(element: ParsedElement): string {
		return element.children.map((child) => child.text ?? "").join("");
	}
}
