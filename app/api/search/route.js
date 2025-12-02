// app/api/search/route.js

import { NextResponse } from "next/server";
import {
  getProductQueryFromUrl,
  fallbackProductQueryFromUrl,
} from "@/lib/productQueryFromUrl";
import { googleSearch } from "@/lib/googleSearch";
import * as cheerio from "cheerio";
// If you want to use ScraperAPI instead of direct fetch, you can import:
// import { fetchHtmlThroughScraper } from "@/lib/scraperClient";

const SECONDHAND_SITES = [
  { name: "Poshmark", domain: "poshmark.com" },
  { name: "eBay", domain: "ebay.com" },
  { name: "Depop", domain: "depop.com" },
  // add more if you want: Vinted, Grailed, Mercari, etc.
];

function isProbablyUrl(str) {
  return str.startsWith("http://") || str.startsWith("https://");
}

function extractBrandFromUrl(url) {
  try {
    const { hostname } = new URL(url); // e.g. "us.brandymelville.com"
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      const sld = parts[parts.length - 2]; // "brandymelville"
      // make it prettier: "Brandy Melville"
      return sld
        .replace(/-/g, " ")
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  } catch {
    // ignore
  }
  return null;
}


// 🔎 Helper: scrape the input URL to get the actual product name
async function getProductNameFromPage(url) {
  try {
    // If you prefer ScraperAPI, swap this fetch for fetchHtmlThroughScraper(url, { render: false })
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn("⚠️ getProductNameFromPage fetch failed:", url, res.status);
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let name = null;

    // 1) Try JSON-LD Product schema
    $('script[type="application/ld+json"]').each((_, el) => {
      if (name) return; // already found
      try {
        const jsonText = $(el).contents().text();
        if (!jsonText) return;

        const parsed = JSON.parse(jsonText);
        const arr = Array.isArray(parsed) ? parsed : [parsed];

        for (const obj of arr) {
          if (obj && obj["@type"] === "Product" && obj.name) {
            name = String(obj.name).trim();
            break;
          }
        }
      } catch {
        // ignore parse errors
      }
    });

    // 2) Fallback: og:title
    if (!name) {
      const ogTitle = $('meta[property="og:title"]').attr("content");
      if (ogTitle) {
        name = ogTitle.trim();
      }
    }

    // 3) Fallback: <title>
    if (!name) {
      const title = $("title").text();
      if (title) {
        name = title.trim();
      }
    }

    if (!name) return null;

    // Clean common patterns like "Product Name | Poshmark" or "Product Name - Depop"
    const cleaned = name
      .split("|")[0]
      .split("•")[0]
      .split(" – ")[0]
      .split("- Poshmark")[0]
      .split("- Depop")[0]
      .split("- eBay")[0]
      .trim();

    return cleaned || name;
  } catch (err) {
    console.error("getProductNameFromPage error:", url, err);
    return null;
  }
}

async function enrichListingFromPage(listing) {
  try {
    const res = await fetch(listing.link, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn("⚠️ Enrich fetch failed:", listing.link, res.status);
      return listing;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let image = listing.thumbnail || null;
    let price = listing.price || null;
    let isOutOfStock = false;

    // Look for JSON-LD: <script type="application/ld+json"> { "@type": "Product", ... }
    $('script[type="application/ld+json"]').each((_, el) => {
      if (isOutOfStock) return false;
      try {
        const jsonText = $(el).contents().text();
        if (!jsonText) return;

        const parsed = JSON.parse(jsonText);
        const arr = Array.isArray(parsed) ? parsed : [parsed];

        for (const obj of arr) {
          if (!obj) continue;

          // --- 🔎 availability check (Out of Stock) ---
          const availability =
            obj?.offers?.availability ||
            obj?.offers?.itemAvailability ||
            obj?.availability ||
            obj?.itemAvailability;

          if (
            typeof availability === "string" &&
            availability.toLowerCase().includes("outofstock")
          ) {
            isOutOfStock = true;
            break; // break out of the for...of
          }

          // --- existing Product parsing ---
          if (obj["@type"] === "Product") {
            // Image
            if (!image && obj.image) {
              if (Array.isArray(obj.image)) {
                image = obj.image[0];
              } else {
                image = obj.image;
              }
            }

            // Price
            if (!price && obj.offers && obj.offers.price) {
              const p = obj.offers.price;
              const currency = obj.offers.priceCurrency || "";
              price =
                currency && String(p).match(/^\d/)
                  ? `${currency}${p}`
                  : String(p);
            }
          }
        }
      } catch {
        // ignore JSON parse errors
      }
    });

    if (isOutOfStock) {
      console.log("🚫 Skipping out-of-stock listing:", listing.link);
      return null;
    }
    
    return {
      ...listing,
      thumbnail: image || listing.thumbnail,
      price: price || listing.price,
    };
  } catch (err) {
    console.error("enrichListingFromPage error:", listing.link, err);
    return listing;
  }
}

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ products: [] });
    }

    let searchPhrase = query;
    let coreForMatching = query;

    if (isProbablyUrl(query)) {
      console.log("🌐 Received URL query:", query);

      // 🔥 NEW: try scraping the actual product name from the input URL

      const brandFromUrl = extractBrandFromUrl(query);
      const scrapedName = await getProductNameFromPage(query);

      if (scrapedName) {
        console.log("🧷 scraped product name:", scrapedName);
        searchPhrase = scrapedName;
        coreForMatching = scrapedName;
        searchPhrase = brandFromUrl
          ? `${brandFromUrl} ${scrapedName}`          // "Brandy Melville Halie Top"
          : scrapedName;  
      } else {
        console.warn(
          "⚠️ getProductNameFromPage failed, falling back to old URL parsing",
        );
        let info = await getProductQueryFromUrl(query);
        if (!info) {
          console.warn("⚠️ getProductQueryFromUrl failed, using fallback");
          info = fallbackProductQueryFromUrl(query);
        }

        const { productCore, brand } = info;
        coreForMatching = productCore;
        searchPhrase = brand ? `${brand} ${productCore}` : productCore;
      }
    }

    console.log("🧵 final searchPhrase:", searchPhrase);

    // 1) CALL GOOGLE FOR EACH SECONDHAND SITE → fill allResults
    const allResults = [];

    for (const site of SECONDHAND_SITES) {
      const siteQuery = `${searchPhrase}`;
      console.log("🔍 marketplace query:", siteQuery);

      const items = await googleSearch(siteQuery);

      for (const item of items) {
        allResults.push({
          title: item.title,
          price: item.price,
          thumbnail: item.thumbnail,
          link: item.link,
          source: site.name,
        });
      }
    }

    console.log("🧺 total raw results:", allResults.length);

    // 🔁 DEDUPE BY URL (normalize link)
    const seen = new Set();
    const dedupedResults = [];

    for (const r of allResults) {
      if (!r.link) continue;

      const key = r.link.split("?")[0].toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      dedupedResults.push(r);
    }

    console.log("🧺 after dedupe:", dedupedResults.length);

    // 2) Enrich only the top few results from their individual pages
    const MAX_ENRICH = dedupedResults.length;
    const toEnrich = dedupedResults.slice(0, MAX_ENRICH);
    const rest = dedupedResults.slice(MAX_ENRICH);

    const enrichedTop = await Promise.all(
      toEnrich.map((listing) => enrichListingFromPage(listing)),
    );

    const mergedResults = [...enrichedTop.filter(Boolean), ...rest];

    // 3) Mark exact vs similar
    const coreTokens = coreForMatching
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const products = mergedResults.map((p, index) => {
      const titleLower = (p.title || "").toLowerCase();

      // you can tweak this later to "most tokens" instead of all
      const isExact =
        coreTokens.length > 0
          ? coreTokens.every((tok) => titleLower.includes(tok))
          : true;

      return {
        id: index,
        title: p.title,
        price: p.price,
        thumbnail: p.thumbnail,
        link: p.link,
        source: p.source,
        exact: isExact,
      };
    });

    return NextResponse.json({
      products,
      title: searchPhrase,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ products: [] });
  }
}
