import { Descendant } from "slate";
import {
  CANVAS_ELEMENT_TYPES,
  type CanvasElementType,
  type CanvasElement,
} from "../types";
import { makeNodeId } from "./nodeUtils";
import { parseXmlTag } from "./parseXmlTag";

const DEFAULT_TAG_TYPE: CanvasElementType = "narration";
const MIN_BUFFER_LENGTH = 5;

export class OSMLSerializer {
  private processedSinceLastEmit = 0;
  private buffer = "";
  private nodes: CanvasElement[] = [];

  private static readonly VALID_TYPES: Set<string> = new Set(
    CANVAS_ELEMENT_TYPES,
  );

  static serialize(descendants: Descendant[]): string {
    let osml = "";

    for (const node of descendants) {
      const element = node as CanvasElement;
      const content = OSMLSerializer.getTextContent(element);
      const tagName = element.type;
      const attributes = element.customAttributes ?? {};

      if (tagName === "narration") {
        osml += content + "\n";
        continue;
      }

      const attrString = Object.entries(attributes)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join("");

      osml += `<${tagName}${attrString}>${content}</${tagName}>\n`;
    }

    return osml.trim();
  }

  appendChunk(chunk: string): boolean {
    this.buffer += chunk;
    return this.parseBuffer();
  }

  getNodes(): Descendant[] {
    return this.nodes;
  }

  private parseBuffer(): boolean {
    const tagPattern = /<([^<>/][^<>]*?)>|<\/([^<>/][^<>]*?)>/g;

    if (this.shouldFlushBuffer()) {
      this.updateCurrent(this.buffer);
      this.buffer = "";
      return true;
    }

    let lastIndex = 0;
    let match: RegExpExecArray | null = null;
    let updated = false;

    while ((match = tagPattern.exec(this.buffer)) !== null) {
      const text = this.buffer.slice(lastIndex, match.index);
      if (text.trim()) {
        this.updateCurrent(text);
        updated = true;
      }

      const openTag = match[1];
      if (openTag) {
        const { tag, ...attributes } = parseXmlTag(openTag);
        this.appendNext(this.mapTagToType(tag), attributes);
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
    this.processedSinceLastEmit += text?.length ?? 0;
  }

  private appendNext(
    type: CanvasElementType,
    attributes: Record<string, string>,
  ): void {
    const next: CanvasElement = {
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

  private mapTagToType(tagName: string): CanvasElementType {
    const normalized = tagName.toLowerCase();
    return OSMLSerializer.VALID_TYPES.has(normalized)
      ? (normalized as CanvasElementType)
      : DEFAULT_TAG_TYPE;
  }

  static getTextContent(element: CanvasElement): string {
    return element.children.map((child) => child.text ?? "").join("");
  }
}
