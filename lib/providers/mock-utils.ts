import fs from "fs";
import path from "path";

export function readMockFile(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public", "mock", filename));
}

export function readMockFileAsArrayBuffer(filename: string): ArrayBuffer {
  const buf = readMockFile(filename);
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}
