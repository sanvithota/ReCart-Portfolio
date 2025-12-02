// app/api/search/route.js

import { googleSearch } from "@/lib/googleSearch";
import {
  fallbackProductQueryFromUrl,
  getProductQueryFromUrl,
} from "@/lib/productQueryFromUrl";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

const SECONDHAND_SITES = [
  { name: "Poshmark", domain: "poshmark.com" },
  { name: "eBay", domain: "ebay.com" },
  { name: "Depop", domain: "depop.com" },
];

function isProbablyUrl(str) {
  return str.startsWith("http://") || str.startsWith("https://");
}

function extractBrandFromUrl(url) {
  try {
    const { hostname } = new URL(url);
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      const sld = parts[parts.length - 2];
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

// 🆕 Extract sizes from text - accept 1-3 sizes only (not size charts)
function extractSizes(text) {
  const sizes = new Set(); // Use Set to avoid duplicates
  const lower = text.toLowerCase();
  
  // Pattern 1: Explicit "size X" or "size: X"
  const explicitSizes = lower.match(/\bsize\s*:?\s*(xx?s|xs|small|medium|m|large|l|xx?l|[0-9]{1,2}[wl]?|[0-9]x)\b/gi);
  if (explicitSizes) {
    explicitSizes.forEach(match => {
      const sizeMatch = match.match(/(xx?s|xs|small|medium|m|large|l|xx?l|[0-9]{1,2}[wl]?|[0-9]x)$/i);
      if (sizeMatch) {
        const extracted = sizeMatch[1];
        // Convert to letter size
        const letterSize = convertToLetterSize(extracted);
        if (letterSize) sizes.add(letterSize);
      }
    });
  }
  
  // Pattern 2: Pipe format like "|25|" or "| S |"
  const pipeMatches = text.match(/\|\s*([0-9]{1,2}[wl]?|xx?s|xs|s|m|l|xl|xx?l|[0-9]x)\s*\|/gi);
  if (pipeMatches && pipeMatches.length <= 3) { // Only if not a size chart
    pipeMatches.forEach(match => {
      const sizeMatch = match.match(/\|\s*([^|]+)\s*\|/i);
      if (sizeMatch) {
        const letterSize = convertToLetterSize(sizeMatch[1].trim());
        if (letterSize) sizes.add(letterSize);
      }
    });
  }
  
  // Pattern 3: Standalone letter sizes at word boundaries (be careful here)
  if (sizes.size === 0) {
    const standaloneMatches = lower.match(/\b(xx?s|xs|small|medium|m|large|l|xx?l|[0-9]x)\b/gi);
    if (standaloneMatches && standaloneMatches.length <= 3) {
      standaloneMatches.forEach(match => {
        const letterSize = convertToLetterSize(match);
        if (letterSize) sizes.add(letterSize);
      });
    }
  }
  
  const result = Array.from(sizes);
  
  // Only return if we found 1-3 sizes (not a size chart)
  return result.length <= 3 ? result : [];
}

function convertToLetterSize(sizeStr) {
  const cleaned = sizeStr.toLowerCase().trim().replace(/[wl]$/, '');
  
  // Already a letter size
  if (/^(xx?s|xs|s|m|l|xl|xx?l|[0-9]x)$/i.test(cleaned)) {
    let size = cleaned.toUpperCase()
      .replace(/SMALL/i, "S")
      .replace(/MEDIUM/i, "M")
      .replace(/LARGE/i, "L");
    
    if (['XS', 'XXS', 'S', 'M', 'L', 'XL', 'XXL', '2X', '3X'].includes(size)) {
      return size;
    }
  }
  
  // Numeric size - convert to letter
  const num = parseInt(cleaned);
  if (!isNaN(num)) {
    // Dress sizes (0-20)
    if (num >= 0 && num <= 2) return "XS";
    if (num >= 4 && num <= 6) return "S";
    if (num >= 8 && num <= 10) return "M";
    if (num >= 12 && num <= 14) return "L";
    if (num >= 16 && num <= 18) return "XL";
    if (num >= 20 && num <= 22) return "2X";
    // Jean waist sizes (23-36)
    if (num >= 23 && num <= 25) return "XS";
    if (num >= 26 && num <= 28) return "S";
    if (num >= 29 && num <= 31) return "M";
    if (num >= 32 && num <= 34) return "L";
    if (num >= 35 && num <= 36) return "XL";
  }
  
  return null;
}

// 🆕 Extract condition from text
function extractCondition(text) {
  const lower = text.toLowerCase();
  
  if (/new\s*with\s*tags?|\bnwt\b|brand\s*new|never\s*worn/i.test(lower)) return "New";
  if (/like\s*new|excellent|pristine|mint/i.test(lower)) return "Like New";
  if (/\bgood\b|gently\s*used|pre[-\s]?owned/i.test(lower)) return "Good";
  if (/\bfair\b|some\s*wear|worn/i.test(lower)) return "Fair";
  
  return null;
}

async function getProductNameFromPage(url) {
  try {
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

    $('script[type="application/ld+json"]').each((_, el) => {
      if (name) return;
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

    if (!name) {
      const ogTitle = $('meta[property="og:title"]').attr("content");
      if (ogTitle) name = ogTitle.trim();
    }

    if (!name) {
      const title = $("title").text();
      if (title) name = title.trim();
    }

    if (!name) return null;

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
    
    // 🔧 Smart size extraction from page - look for "size" but ignore "size-chart"
    let sizes = listing.sizes || [];
    
    if (sizes.length === 0) {
      // Get page text but remove size chart sections
      let pageText = $('body').text();
      
      // Remove common size chart sections
      pageText = pageText.replace(/size\s*chart/gi, '');
      pageText = pageText.replace(/size\s*guide/gi, '');
      pageText = pageText.replace(/sizing\s*information/gi, '');
      
      // Look for "Size: X" or "Size X" pattern in the cleaned text
      const sizeMatches = pageText.match(/\bsize\s*:?\s*(xx?s|xs|small|medium|m|large|l|xx?l|[0-9]{1,2}[wl]?|[0-9]x)\b/gi);
      
      if (sizeMatches && sizeMatches.length > 0) {
        // Take only the first 1-2 matches to avoid getting chart data
        const firstMatches = sizeMatches.slice(0, 2);
        const extracted = [];
        
        firstMatches.forEach(match => {
          const sizeMatch = match.match(/\bsize\s*:?\s*(xx?s|xs|small|medium|m|large|l|xx?l|[0-9]{1,2}[wl]?|[0-9]x)\b/i);
          if (sizeMatch) {
            const letterSize = convertToLetterSize(sizeMatch[1]);
            if (letterSize && !extracted.includes(letterSize)) {
              extracted.push(letterSize);
            }
          }
        });
        
        if (extracted.length > 0 && extracted.length <= 3) {
          sizes = extracted;
          console.log(`✅ Found size on page for ${listing.link.substring(0, 50)}:`, sizes);
        }
      }
    }

    // Extract condition from page
    const condition = extractCondition($('body').text());

    let image = listing.thumbnail || null;
    let price = listing.price || null;
    let isOutOfStock = false;

    $('script[type="application/ld+json"]').each((_, el) => {
      if (isOutOfStock) return false;
      try {
        const jsonText = $(el).contents().text();
        if (!jsonText) return;

        const parsed = JSON.parse(jsonText);
        const arr = Array.isArray(parsed) ? parsed : [parsed];

        for (const obj of arr) {
          if (!obj) continue;

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
            break;
          }

          if (obj["@type"] === "Product") {
            if (!image && obj.image) {
              if (Array.isArray(obj.image)) {
                image = obj.image[0];
              } else {
                image = obj.image;
              }
            }

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
      sizes: sizes.length > 0 ? sizes : undefined,
      condition: condition || listing.condition || undefined,
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

      const brandFromUrl = extractBrandFromUrl(query);
      const scrapedName = await getProductNameFromPage(query);

      if (scrapedName) {
        console.log("🧷 scraped product name:", scrapedName);
        searchPhrase = scrapedName;
        coreForMatching = scrapedName;
        searchPhrase = brandFromUrl
          ? `${brandFromUrl} ${scrapedName}`
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

    const allResults = [];

    for (const site of SECONDHAND_SITES) {
      const siteQuery = `${searchPhrase}`;
      console.log("🔍 marketplace query:", siteQuery);

      const items = await googleSearch(siteQuery);

      for (const item of items) {
        // 🆕 Extract sizes from title MORE AGGRESSIVELY
        const titleAndSnippet = `${item.title || ""} ${item.snippet || ""}`;
        const quickSizes = extractSizes(titleAndSnippet);
        const quickCondition = extractCondition(titleAndSnippet);
        
        console.log(`📦 Item: "${item.title?.substring(0, 60)}..." → Sizes: [${quickSizes.join(', ')}]`);
        
        allResults.push({
          title: item.title,
          price: item.price,
          thumbnail: item.thumbnail,
          link: item.link,
          source: site.name,
          sizes: quickSizes.length > 0 ? quickSizes : undefined,
          condition: quickCondition || undefined,
        });
      }
    }

    console.log("🧺 total raw results:", allResults.length);

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

    const MAX_ENRICH = dedupedResults.length;
    const toEnrich = dedupedResults.slice(0, MAX_ENRICH);
    const rest = dedupedResults.slice(MAX_ENRICH);

    const enrichedTop = await Promise.all(
      toEnrich.map((listing) => enrichListingFromPage(listing)),
    );

    const mergedResults = [...enrichedTop.filter(Boolean), ...rest];

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
        sizes: p.sizes, // 🆕 Pass sizes to frontend
        condition: p.condition, // 🆕 Pass condition to frontend
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