import fs from "node:fs";

const [input = "index.html", output = "src/i18n/pl.json"] = process.argv.slice(2);
const source = fs.readFileSync(input, "utf8");
const decode = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

const translations = {};
for (const match of source.matchAll(/data-en="([\s\S]*?)"\s+data-pl="([\s\S]*?)"/g)) {
  translations[decode(match[1])] = decode(match[2]);
}

fs.writeFileSync(output, `${JSON.stringify(translations, null, 2)}\n`, "utf8");
console.log(`Extracted ${Object.keys(translations).length} translations to ${output}`);
