import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";

const browser = puppeteer.launch({
  headless: true,
  pipe: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--js-flags=--noexpose_wasm,--jitless",
  ],
  dumpio: true,
});

export async function POST(req: NextRequest) {
  const html = await req.text();

  let page = await (await browser).newPage();
  page.setJavaScriptEnabled(false);

  await page.setContent(html, {
    timeout: 1000,
  });

  const stream = await page.createPDFStream({
    omitBackground: true,
    format: "A4",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
