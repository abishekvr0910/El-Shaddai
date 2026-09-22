import { chromium } from "../../elshaddai/app/node_modules/@playwright/test/index.mjs";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true });

async function capture(viewport, suffix) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${baseUrl}/?lang=pl`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `artifacts/audit-${suffix}-first-fold.png` });

  const sections = [
    "hero",
    "experience-section",
    "story-section",
    "menu-section",
    "ksero-section",
    "location-section",
    "reviews-section",
  ];

  for (const id of sections) {
    const section = page.locator(`#${id}`);
    if (await section.count()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
    }
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `artifacts/audit-${suffix}-full.png`, fullPage: true });

  for (const id of sections) {
    const section = page.locator(`#${id}`);
    if (await section.count()) {
      await section.screenshot({ path: `artifacts/audit-${suffix}-${id}.png` });
    }
  }

  const metrics = await page.evaluate(() => ({
    pageHeight: document.documentElement.scrollHeight,
    headings: document.querySelectorAll("h1, h2, h3").length,
    buttonsAndLinks: document.querySelectorAll("a, button").length,
    sections: document.querySelectorAll("main section").length,
    stickyOrFixed: [...document.querySelectorAll("body *")].filter((element) => {
      const position = getComputedStyle(element).position;
      return position === "fixed" || position === "sticky";
    }).length,
  }));

  console.log(`${suffix}: ${JSON.stringify(metrics)}`);
  await page.close();
}

await capture({ width: 1440, height: 1000 }, "desktop");
await capture({ width: 390, height: 844 }, "mobile");
await browser.close();
