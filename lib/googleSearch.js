// lib/googleSearch.js

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

export async function googleSearch(query) {
    console.log("🔸 googleSearch called with:", query);
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    throw new Error("Missing GOOGLE_API_KEY or GOOGLE_CX in env");
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("cx", GOOGLE_CX);
  url.searchParams.set("q", query);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("Google search failed", await res.text());
    throw new Error("Google search failed");
  }

  const data = await res.json();
  console.log("🔸 googleSearch items length:", data.items?.length || 0);

  const items = (data.items || []).map((item, index) => ({
    id: index,
    title: item.title,
    link: item.link,
    thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || null,
    source: "Google",
    price: null, // you can parse price from snippet later if you want
  }));

  return items;
}
