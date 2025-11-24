import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { googleSearch } from "@/lib/googleSearch";

function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// Try to pull useful text from the product page (title, og tags)
async function buildQueryFromUrl(urlString) {
  try {
    const res = await fetch(urlString, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(
        "Failed to fetch product page",
        urlString,
        res.status
      );
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
    const pageTitle = $("title").text().trim();

    // 1) pick a single base title (prefer og:title)
    let baseTitle = ogTitle || pageTitle || "";
    if (!baseTitle) return null;

    // 2) cut off everything after the first "|" (e.g. "... | PacSun")
    baseTitle = baseTitle.split("|")[0].trim();

    // 3) detect brand from hostname instead of hardcoding
    const u = new URL(urlString);
    const hostParts = u.hostname.replace("www.", "").split(".");
    // e.g. shop.lululemon.com -> "lululemon", pacsun.com -> "pacsun"
    const brandBase =
      hostParts.length >= 2
        ? hostParts[hostParts.length - 2]
        : hostParts[0];

    // remove brand word(s) from title tokens (we'll add brand back later)
    let tokens = baseTitle.split(/\s+/).filter(Boolean);
    tokens = tokens.filter(
      (w) => w.toLowerCase() !== brandBase.toLowerCase()
    );

    // 4) optionally limit to first N words so query isn't too specific
    const MAX_WORDS = 6;
    tokens = tokens.slice(0, MAX_WORDS);

    const cleanTitle = tokens.join(" ").trim();

    // add brand + generic clothing context
    const raw = `${cleanTitle || baseTitle} ${brandBase} clothing secondhand`;
    const query = raw.replace(/\s+/g, " ").trim();

    return query;
  } catch (err) {
    console.error("Error building query from URL", err);
    return null;
  }
}



// Fallback: derive some words from the URL path itself
function fallbackQueryFromUrl(urlString) {
  try {
    const u = new URL(urlString);

    const hostParts = u.hostname.replace("www.", "").split(".");
    const brandBase =
      hostParts.length >= 2
        ? hostParts[hostParts.length - 2]
        : hostParts[0];

    const segments = u.pathname.split("/").filter(Boolean);

    const meaningfulSegments = [];
    for (const seg of segments) {
      const lower = seg.toLowerCase();

      // skip common structural junk that appears on many sites
      if (
        ["p", "_", "product", "products", "category", "shop", "us", "en"].includes(
          lower
        )
      ) {
        continue;
      }

      // stop when we hit an id-looking segment
      if (/^(sku|prod|id)[0-9a-z\-]*/.test(lower)) {
        break;
      }

      meaningfulSegments.push(seg);
    }

    let namePart = meaningfulSegments
      .join(" ")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const words = namePart.split(" ").filter(Boolean);
    const filteredWords = words.filter((w) => {
      const lower = w.toLowerCase();
      if (/^\d+$/.test(w)) return false;               // pure numbers
      if (["full", "length", "size", "new", "women", "mens"].includes(lower))
        return true; // keep these if you want
      return true;
    });

    const cleanName = filteredWords.join(" ").trim();

    const base = cleanName || namePart || brandBase;
    const raw = `${base} ${brandBase} clothing secondhand`;
    const query = raw.replace(/\s+/g, " ").trim();

    return query;
  } catch {
    return urlString;
  }
}


export async function POST(req) {
  try {
    const { query } = await req.json();
    const cleanedQuery = (query || "").trim();

    if (!cleanedQuery) {
      return NextResponse.json({ products: [] });
    }

    let finalQuery = cleanedQuery;

    // If it's a URL, try to build something smarter
    if (isUrl(cleanedQuery)) {
      // 1) Try reading the actual page
      const fromPage = await buildQueryFromUrl(cleanedQuery);

      if (fromPage) {
        finalQuery = fromPage;
      } else {
        // 2) Fallback: at least use words from the URL path
        finalQuery = fallbackQueryFromUrl(cleanedQuery);
      }
    }

    console.log("🔎 finalQuery for search:", finalQuery);

    const items = await googleSearch(finalQuery);

    const products =
      items?.map((item) => ({
        title: item.title,
        price: item.price,          // currently null; you can improve later
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
