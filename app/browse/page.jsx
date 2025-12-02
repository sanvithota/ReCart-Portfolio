"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import SizeFilter from "@/components/SizeFilter";

export default function Browse() {
  const params = useSearchParams();

  // RAW RESULTS
  const results = JSON.parse(params.get("results") || "[]");
  const headerTitle = params.get("title") || "Search results";

  // Convert API → UI format
  const items = results.map((item, i) => {
    const match = item.price ? String(item.price).match(/[\d,.]+/) : null;
    const priceString = match ? match[0] : "0";

    return {
      id: i,
      title: item.title,
      image: item.thumbnail,
      platform: item.source,
      size: "M",
      quality: "Good",
      price: parseFloat(priceString.replace(/,/g, "")) || 0,
      link: item.link,
      exact: item.exact ?? true,
    };
  });

  // FILTER STATE
  const [sizes, setSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [quality, setQuality] = useState(null);

  // FILTER LOGIC
  const filtered = items.filter(item => {
    if (item.price <= 0) return false;

    const title = (item.title || "").toLowerCase();
    if (
      title.includes("sold out") ||
      title.includes("sold-out") ||
      title.includes("sold") ||
      title.includes("out of stock")
    ) return false;

    if (sizes.length > 0 && !sizes.includes(item.size)) return false;
    if (quality && item.quality !== quality) return false;
    if (maxPrice !== 200 && item.price > maxPrice) return false;

    return true;
  });

  const exactMatches = filtered.filter(i => i.exact);
  const similarItems = filtered.filter(i => !i.exact);

  return (
    <main className="min-h-screen bg-[#f7f4ed]">
      <Navbar />

      {/* SEARCH BAR */}
      <div className="w-full bg-[#f7f4ed] py-10 px-4">
        <div className="max-w-[900px] mx-auto">
          <div className="flex bg-white rounded-full shadow-md overflow-hidden">
            <div className="px-5 py-3 text-xl text-[#6c745f]">+</div>
            <input
              value={params.get("query") || ""}
              readOnly
              className="flex-1 px-2 py-3 outline-none text-lg text-[#4f584b]"
            />
            <button className="bg-[#8b9275] px-6 text-white text-2xl">
              →
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex gap-10 pb-24">

        {/* LEFT FILTERS (sticky) */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-fit space-y-6">

          {/* Sizes */}
          <div className="bg-[#d6d9d0] p-5 rounded-xl shadow-sm">
            <p className="font-semibold text-lg text-[#5d6551] mb-3">
              Filter by size
            </p>
            <SizeFilter selected={sizes} setSelected={setSizes} />
          </div>

          {/* Price */}
          <div className="bg-[#d6d9d0] p-5 rounded-xl shadow-sm">
            <p className="font-semibold text-lg text-[#5d6551]">Filter by price</p>
            <input
              type="range"
              min="5"
              max="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-[#e96a9d]"
            />
            <p className="mt-2 text-sm text-[#5d6551]">Max: ${maxPrice}</p>
          </div>

          {/* Quality */}
          <div className="bg-[#d6d9d0] p-5 rounded-xl shadow-sm">
            <p className="font-semibold text-lg text-[#5d6551]">Filter by quality</p>
            <div className="flex flex-col gap-2 mt-3">
              {["Excellent", "Good", "Fair"].map((q) => (
                <button
                  key={q}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition
                    ${quality === q ? "bg-[#8b9275] text-white" : "bg-[#e5e7de] text-[#5d6551] hover:bg-[#dcded4]"}
                  `}
                  onClick={() => setQuality(quality === q ? null : q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">

          {/* MAIN HEADER */}
          <div className="bg-[#d2b19c] px-6 py-5 rounded-xl shadow-sm mb-8">
            <h1 className="text-2xl font-semibold text-[#5d5148]">{headerTitle}</h1>
            <p className="text-[#5d5148] mt-1">{filtered.length} results found</p>
          </div>

          {/* EXACT MATCHES */}
          <SectionHeader title="Exact matches" />
          {exactMatches.length === 0 ? (
            <p className="text-[#7b8170]">No exact matches found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10">
              {exactMatches.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* SIMILAR ITEMS */}
          <SectionHeader title="Similar items" />
          {similarItems.length === 0 ? (
            <p className="text-[#7b8170]">No similar items found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {similarItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
