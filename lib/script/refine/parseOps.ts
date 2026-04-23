import { refineOpSchema, type RefineOp } from "./types";

export class RefineOpParser {
  private buffer = "";

  push(chunk: string): RefineOp[] {
    this.buffer += chunk;
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() ?? "";
    return this.parseLines(lines);
  }

  flush(): RefineOp[] {
    const remaining = this.buffer.trim();
    this.buffer = "";
    if (!remaining) return [];
    return this.parseLines([remaining]);
  }

  private parseLines(lines: string[]): RefineOp[] {
    return lines
      .map((l) => l.trim())
      .filter(Boolean)
      .flatMap((l) => {
        try {
          const result = refineOpSchema.safeParse(JSON.parse(l));
          return result.success ? [result.data] : [];
        } catch (e) {
          return [];
        }
      });
  }
}
