// lib/googleSearch.js

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

/**
 * Calls Google Custom Search API and returns formatted results.
 */
export async function googleSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.error("❌ Missing GOOGLE_API_KEY or GOOGLE_CX");
    return [];
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("cx", GOOGLE_CX);
  url.searchParams.set("q", query);

  console.log("🔸 googleSearch called with:", query);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("❌ Google search failed:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const items = data.items || [];

  console.log("🔸 googleSearch items length:", items.length);

  return items.map((item) => {
    const pagemap = item.pagemap || {};

    const thumbnail =
      (pagemap.cse_thumbnail && pagemap.cse_thumbnail[0]?.src) ||
      (pagemap.cse_image && pagemap.cse_image[0]?.src) ||
      null;

    const offerPrice =
      Array.isArray(pagemap.offer) && pagemap.offer[0]
        ? pagemap.offer[0].price
        : null;

    const snippetPriceMatch = item.snippet
      ? item.snippet.match(/\$[\d,.]+/)
      : null;

    const price = offerPrice || (snippetPriceMatch ? snippetPriceMatch[0] : null);

    return {
      title: item.title || "",
      link: item.link,
      thumbnail,
      price,
      source: item.displayLink || "Google",
    };
  });
}
