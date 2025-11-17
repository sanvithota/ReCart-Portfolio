import { NextResponse } from "next/server";

const SERP_KEY = process.env.NEXT_PUBLIC_SERPAPI_KEY;

// Extract search keywords from product title or URL
function extractKeywords(text) {
  if (!text) return "";

  return text
    .replace(/https?:\/\/\S+/g, "") // remove URL junk
    .replace(/[^a-zA-Z0-9 ]/g, " ") // remove symbols
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 6) // limit keyword count
    .join(" ");
}

// Normalize price
function parsePrice(str) {
  if (!str) return null;
  return parseFloat(str.replace(/[^0-9.]/g, ""));
}

// Format results into a unified structure
function normalize(items, source) {
  return items
    .map((item) => ({
      title: item.title || item.product_title || "No title",
      thumbnail:
        item.thumbnail || item.product_thumbnail || item.image || null,
      price: parsePrice(item.price),
      link: item.link || item.product_link || item.url,
      source,
    }))
    .filter((i) => i.title && i.link);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const query = extractKeywords(body.query);

    if (!query) return NextResponse.json({ products: [] });

    // ------- SerpAPI Requests -------
    const ebayUrl = `https://serpapi.com/search.json?engine=ebay&q=${encodeURIComponent(
      query
    )}&api_key=${SERP_KEY}`;

    const depopUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
      "site:depop.com " + query
    )}&api_key=${SERP_KEY}`;

    const poshUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
      "site:poshmark.com " + query
    )}&api_key=${SERP_KEY}`;

    const [ebayRes, depopRes, poshRes] = await Promise.all([
      fetch(ebayUrl).then((r) => r.json()),
      fetch(depopUrl).then((r) => r.json()),
      fetch(poshUrl).then((r) => r.json()),
    ]);

    // ----- Normalize all results -----
    const ebayItems = normalize(ebayRes?.organic_results || [], "eBay");
    const depopItems = normalize(depopRes?.organic_results || [], "Depop");
    const poshItems = normalize(poshRes?.organic_results || [], "Poshmark");

    const combined = [...ebayItems, ...depopItems, ...poshItems];

    return NextResponse.json({ products: combined });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
