// app/api/search/route.js

import { NextResponse } from "next/server";
import {
  getProductQueryFromUrl,
  fallbackProductQueryFromUrl,
} from "@/lib/productQueryFromUrl";
import { googleSearch } from "@/lib/googleSearch";
import * as cheerio from "cheerio";

const SECONDHAND_SITES = [
  { name: "Poshmark", domain: "poshmark.com" },
  { name: "eBay", domain: "ebay.com" },
  { name: "Depop", domain: "depop.com" },
  // add more if you want: Vinted, Grailed, Mercari, etc.
];

function isProbablyUrl(str) {
  return str.startsWith("http://") || str.startsWith("https://");
}

async function enrichListingFromPage(listing) {
  try {
    // Just fetch directly from your server (no ScraperAPI here)
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

    // Look for JSON-LD: <script type="application/ld+json"> { "@type": "Product", ... }
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).contents().text();
        if (!jsonText) return;

        const parsed = JSON.parse(jsonText);
        const arr = Array.isArray(parsed) ? parsed : [parsed];

        for (const obj of arr) {
          if (obj && obj["@type"] === "Product") {
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

      let info = await getProductQueryFromUrl(query);
      if (!info) {
        console.warn("⚠️ getProductQueryFromUrl failed, using fallback");
        info = fallbackProductQueryFromUrl(query);
      }

      const { productCore, brand } = info;
      coreForMatching = productCore;
      // either "brand product" or "product brand" is fine, this is your search string
      searchPhrase = brand ? `${brand} ${productCore}` : productCore;
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

    // 2) Enrich only the top few results from their individual pages
    const MAX_ENRICH = 8;
    const toEnrich = allResults.slice(0, MAX_ENRICH);
    const rest = allResults.slice(MAX_ENRICH);

    const enrichedTop = await Promise.all(
      toEnrich.map((listing) => enrichListingFromPage(listing))
    );

    const mergedResults = [...enrichedTop, ...rest];

    // 3) Mark exact vs similar
    const coreTokens = coreForMatching
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const products = mergedResults.map((p, index) => {
      const titleLower = (p.title || "").toLowerCase();
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
