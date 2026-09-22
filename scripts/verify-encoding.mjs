import fs from "node:fs";
import path from "node:path";

const files = [
  "index.html",
  ...fs.readdirSync("src/i18n")
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join("src/i18n", name)),
];
const utf8 = new TextDecoder("utf-8", { fatal: true });
const mojibake = /[ÃÄÅÂâð�]/u;
const failures = [];

for (const file of files) {
  let source;
  try {
    source = utf8.decode(fs.readFileSync(file));
  } catch {
    failures.push(`${file}: file is not valid UTF-8`);
    continue;
  }

  const match = source.match(mojibake);
  if (match) failures.push(`${file}: possible Mojibake marker “${match[0]}”`);
  if (file.endsWith(".json")) {
    try {
      JSON.parse(source.replace(/^\uFEFF/, ""));
    } catch (error) {
      failures.push(`${file}: invalid JSON (${error.message})`);
    }
  }
}

const html = fs.readFileSync("index.html", "utf8");
if (!html.slice(0, 1024).includes('<meta charset="UTF-8"')) {
  failures.push("index.html: UTF-8 charset declaration is missing from the document head");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`UTF-8 verification passed for ${files.length} source files`);
