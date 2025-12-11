// lib/productQueryFromUrl.js

import * as cheerio from "cheerio";
import { fetchHtmlThroughScraper } from "./scraperClient";

/**
 * Given a product URL (PacSun/Lulu/UO/etc.), fetch the page and
 * extract a nice search phrase + brand.
 */
export async function getProductQueryFromUrl(urlString) {
  const html = await fetchHtmlThroughScraper(urlString, { render: false });
  if (!html) return null;

  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const pageTitle = $("title").text().trim();

  let baseTitle = ogTitle || pageTitle || "";
  if (!baseTitle) return null;

  baseTitle = baseTitle.split("|")[0].trim();

  const u = new URL(urlString);
  const hostParts = u.hostname.replace("www.", "").split(".");
  const brandBase =
    hostParts.length >= 2
      ? hostParts[hostParts.length - 2]
      : hostParts[0];

  let tokens = baseTitle.split(/\s+/).filter(Boolean);
  tokens = tokens.filter(
    (w) => w.toLowerCase() !== brandBase.toLowerCase()
  );

  // Limit how specific it is
  const MAX_WORDS = 9;
  tokens = tokens.slice(0, MAX_WORDS);

  const cleanTitle = tokens.join(" ").trim();
  const productCore = cleanTitle || baseTitle;

  return { productCore, brand: brandBase };
}

/**
 * Fallback when we can't fetch HTML (403, weird site, etc.):
 */
export function fallbackProductQueryFromUrl(urlString) {
  try {
    const u = new URL(urlString);
    const hostParts = u.hostname.replace("www.", "").split(".");
    const brandBase =
      hostParts.length >= 2
        ? hostParts[hostParts.length - 2]
        : hostParts[0];

    const segments = u.pathname.split("/").filter(Boolean);
    const meaningful = [];

    for (const seg of segments) {
      const lower = seg.toLowerCase();
      if (
        ["p", "_", "product", "products", "category", "shop"].includes(
          lower
        )
      ) {
        continue;
      }
      if (/^(prod|sku|id)[0-9a-z\-]*/.test(lower)) {
        break;
      }
      meaningful.push(seg);
    }

    let namePart = meaningful
      .join(" ")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!namePart) {
      namePart = brandBase;
    }

    return { productCore: namePart, brand: brandBase };
  } catch {
    return { productCore: urlString, brand: "" };
  }
}
