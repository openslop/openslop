import { Descendant } from "slate";
import type { CanvasContentElement, ParsedElement } from "../types";
import { getContentElements, makeNodeId } from "./nodeUtils";
import { isSceneElement } from "./guards";
import { parseXmlTag } from "./parseXmlTag";

const MIN_BUFFER_LENGTH = 5;
const TAG_PATTERN = /<([^<>/][^<>]*?)>|<\/([^<>/][^<>]*?)>/g;

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
				osml += `\n--- Scene ${sceneNum} ---\n`;
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

	appendChunk(chunk: string): boolean {
		this.buffer += chunk;
		return this.parseBuffer();
	}

	getNodes(): ParsedElement[] {
		return this.nodes;
	}

	private parseBuffer(): boolean {
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
				this.appendNext(tag, attributes);
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
		lastChild.text += text ?? "";
	}

	private appendNext(type: string, attributes: Record<string, string>): void {
		const next: ParsedElement = {
			id: makeNodeId(),
			type,
			customAttributes: attributes,
			children: [{ id: makeNodeId(), type, text: "" }],
		};
		this.nodes.push(next);
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
