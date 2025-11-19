import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const serpKey = process.env.NEXT_PUBLIC_SERPAPI_KEY;

    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
      query
    )}&api_key=${serpKey}`;

    const res = await fetch(url);
    const data = await res.json();

    // Extract products
    const products =
      data.shopping_results?.map((item) => ({
        title: item.title,
        price: item.price,
        thumbnail: item.thumbnail,
        source: item.source,
        link: item.link,
      })) || [];

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ products: [] });
  }
}
