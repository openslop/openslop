export function parseXmlTag(tagString: string): Record<string, string> {
  const [rawTag, ...rest] = tagString.trim().split(/\s+/);
  const tag = rawTag.replace(/\/$/, "");
  const attributesString = rest.join(" ");
  const attributes: Record<string, string> = { tag };
  const regex = /(\w+)="([^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(attributesString)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}
