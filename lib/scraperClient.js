// lib/scraperClient.js

const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY;

/**
 * Fetch HTML through ScraperAPI.
 * If SCRAPERAPI_KEY is missing, falls back to direct fetch.
 */
export async function fetchHtmlThroughScraper(url, { render = false } = {}) {
  try {
    // No key? Just do a normal fetch so it still works for you locally.
    if (!SCRAPERAPI_KEY) {
      console.warn("⚠️ SCRAPERAPI_KEY missing, doing direct fetch:", url);
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        },
      });
      if (!res.ok) {
        console.error("Direct fetch failed:", url, res.status);
        return null;
      }
      return await res.text();
    }

    const apiUrl = new URL("https://api.scraperapi.com/");
    apiUrl.searchParams.set("api_key", SCRAPERAPI_KEY);
    apiUrl.searchParams.set("url", url);
    if (render) {
      apiUrl.searchParams.set("render", "true");
    }

    console.log("🧽 ScraperAPI GET:", url);

    const res = await fetch(apiUrl.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("ScraperAPI failed:", res.status, await res.text());
      return null;
    }

    return await res.text();
  } catch (err) {
    console.error("fetchHtmlThroughScraper error:", err);
    return null;
  }
}
