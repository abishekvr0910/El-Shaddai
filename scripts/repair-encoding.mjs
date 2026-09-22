import fs from "node:fs";

const [input = "live.html", output = "index.html"] = process.argv.slice(2);
const source = fs.readFileSync(input, "utf8");

const windows1252 = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f],
]);

const utf8 = new TextDecoder("utf-8", { fatal: true });
const cp1252 = new TextDecoder("windows-1252");
const decodeBytes = (bytes) => {
  let result = "";
  for (let index = 0; index < bytes.length;) {
    const first = bytes[index];
    const width = first >= 0xc2 && first <= 0xdf ? 2
      : first >= 0xe0 && first <= 0xef ? 3
        : first >= 0xf0 && first <= 0xf4 ? 4
          : 1;
    const candidate = bytes.slice(index, index + width);
    const hasContinuations = width > 1
      && candidate.length === width
      && candidate.slice(1).every((byte) => byte >= 0x80 && byte <= 0xbf);
    if (hasContinuations) {
      try {
        result += utf8.decode(Uint8Array.from(candidate));
        index += width;
        continue;
      } catch {
        /* Preserve a genuine Windows-1252 character. */
      }
    }
    result += cp1252.decode(Uint8Array.of(first));
    index += 1;
  }
  return result;
};

let repaired = "";
let buffer = [];
const flush = () => {
  repaired += decodeBytes(buffer);
  buffer = [];
};
for (const character of source) {
  const codePoint = character.codePointAt(0);
  const byte = codePoint <= 0xff ? codePoint : windows1252.get(codePoint);
  if (byte === undefined) {
    flush();
    repaired += character;
  } else {
    buffer.push(byte);
  }
}
flush();
fs.writeFileSync(output, repaired, "utf8");
console.log(`Repaired ${input} -> ${output}`);
