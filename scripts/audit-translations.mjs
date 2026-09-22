import fs from "node:fs";

const file = process.argv[2] ?? "index.html";
const source = fs.readFileSync(file, "utf8");
const mojibake = source.match(/[ÃÄÅÂâ]/g) ?? [];
const polish = source.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) ?? [];

console.log(`file=${file}`);
console.log(`mojibake_markers=${mojibake.length}`);
console.log(`polish_letters=${polish.length}`);

const entries = [...source.matchAll(/data-en="([\s\S]*?)"\s+data-pl="([\s\S]*?)"/g)].map(
  ([, en, pl], index) => ({ index: index + 1, en, pl }),
);

console.log(`translation_pairs=${entries.length}`);
for (const { index, en, pl } of entries) {
  console.log(`\n${index}. EN: ${en}\n   PL: ${pl}`);
}
