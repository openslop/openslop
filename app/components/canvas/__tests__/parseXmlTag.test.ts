import { describe, expect, it } from "vitest";
import { parseXmlTag } from "../utils/parseXmlTag";

describe("parseXmlTag", () => {
  it("parses a tag name only", () => {
    expect(parseXmlTag("image")).toEqual({ tag: "image" });
  });

  it("parses a tag with attributes", () => {
    expect(parseXmlTag('character name="Lyra" gender="female"')).toEqual({
      tag: "character",
      name: "Lyra",
      gender: "female",
    });
  });

  it("strips trailing slash from self-closing tags", () => {
    expect(parseXmlTag("image/")).toEqual({ tag: "image" });
  });

  it("returns just { tag } when there are no attributes", () => {
    const result = parseXmlTag("music");
    expect(Object.keys(result)).toEqual(["tag"]);
    expect(result.tag).toBe("music");
  });
});
