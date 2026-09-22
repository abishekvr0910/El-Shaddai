import fs from "node:fs";

const [input = "index.html", output = input, dictionaryFile = "src/i18n/pl.json"] = process.argv.slice(2);
const dictionary = {
  ...JSON.parse(fs.readFileSync(dictionaryFile, "utf8")),
  ...JSON.parse(fs.readFileSync("src/i18n/pl-overrides.json", "utf8")),
};
const source = fs.readFileSync(input, "utf8");
const decode = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");
const encode = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

let applied = 0;
const localized = source.replace(
  /data-en="([\s\S]*?)"\s+data-pl="([\s\S]*?)"/g,
  (attributes, english) => {
    const key = decode(english);
    const polish = dictionary[key];
    if (!polish) throw new Error(`Missing Polish translation for: ${key}`);
    applied += 1;
    return `data-en="${english}" data-pl="${encode(polish)}"`;
  },
);

fs.writeFileSync(output, localized, "utf8");
console.log(`Applied ${applied} Polish translations to ${output}`);
