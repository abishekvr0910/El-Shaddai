import { chromium } from "../../elshaddai/app/node_modules/@playwright/test/index.mjs";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const failures = [];
const failedAssets = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
page.on("response", (response) => {
  if (response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`);
});

await page.goto(`${baseUrl}/?lang=pl`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(250);

check(await page.locator("html").getAttribute("lang") === "pl", "HTML language was not set to Polish");
check((await page.locator('meta[charset]').getAttribute("charset"))?.toUpperCase() === "UTF-8", "UTF-8 meta declaration is missing");
check((await page.title()).includes("Indyjska kawiarnia"), "Polish page title was not applied");
check(await page.getByText("Kaapi, chai i szybki druk").count() === 1, "Polished hero text is missing");
check(await page.getByText("Wyślij pliki do druku").count() >= 1, "Polished print CTA is missing");

const bodyText = await page.locator("body").innerText();
const mojibakeTokens = ["Ã", "Â", "Ä", "Å", "â€", "â€¢", "ðŸ"];
check(!mojibakeTokens.some((token) => bodyText.includes(token)), "Visible text still contains mojibake markers");
check(/[ąćęłńóśźż]/i.test(bodyText), "Visible Polish text does not contain Polish letters");

const statusText = await page.locator("#live-time-status").innerText();
check(!/OPEN NOW|CLOSED NOW|Closes|Opens/.test(statusText), "Live opening status reverted to English");

const toggle = page.locator("#nav-toggle");
check((await toggle.getAttribute("aria-label")) === "Otwórz menu", "Mobile menu label was not localized");
await toggle.evaluate((element) => element.click());
check((await toggle.getAttribute("aria-label")) === "Zamknij menu", "Open mobile menu label was not localized");

await page.locator('.lang-btn[data-lang="en"]').evaluate((element) => element.click());
await page.waitForTimeout(180);
check(await page.locator("html").getAttribute("lang") === "en", "English toggle did not update the document language");
await page.locator('.lang-btn[data-lang="pl"]').evaluate((element) => element.click());
await page.waitForTimeout(180);
check(await page.evaluate(() => localStorage.getItem("esh_lang")) === "pl", "Polish choice was not persisted");

await page.screenshot({ path: "artifacts/polish-mobile.png", fullPage: true });

const galleryPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
galleryPage.on("response", (response) => {
  if (response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`);
});
await galleryPage.goto(`${baseUrl}/?lang=pl`, { waitUntil: "domcontentloaded" });
const galleryHeading = galleryPage.getByText("Prawdziwe wnętrze • Ceglane ściany • Dużo światła");
await galleryHeading.scrollIntoViewIfNeeded();
await galleryPage.waitForTimeout(300);
const galleryImages = galleryPage.locator('#story-section img[data-en-alt*="El Shaddai"]');
check(await galleryImages.count() === 3, "The real-space gallery does not contain three localized images");
for (const image of await galleryImages.all()) {
  await image.evaluate((element) => element.decode?.().catch(() => {}));
  check(await image.evaluate((element) => element.complete && element.naturalWidth > 0), `Gallery image failed to load: ${await image.getAttribute("src")}`);
}
check((await galleryImages.first().getAttribute("src"))?.endsWith("cafe-aerial.webp"), "The sideways gallery photo is still in use");
check((await galleryImages.last().getAttribute("src"))?.endsWith("story-lounge.webp"), "The blurred composite gallery photo is still in use");
check((await galleryImages.first().getAttribute("alt")) === "Słoneczny stolik przy oknie z roślinami w El Shaddai", "Polish gallery alt text was not applied");
await galleryHeading.locator("xpath=../../..").screenshot({ path: "artifacts/polish-gallery.png" });
await browser.close();

check(failedAssets.length === 0, `Production page returned failed assets:\n${failedAssets.join("\n")}`);

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Polish language checks passed");
