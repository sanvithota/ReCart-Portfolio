"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import SizeFilter from "@/components/SizeFilter";

export default function Browse() {
  const params = useSearchParams();

  // 1. REAL search results passed from URL
  const results = JSON.parse(params.get("results") || "[]");

  // 2. Convert API results into UI-friendly items
  const items = results.map((item, index) => ({
    id: index,
    title: item.title,
    image: item.thumbnail,
    platform: item.source,
    size: "M", // temporary until we add size extraction logic
    quality: "Good", // temporary (SerpAPI does not include condition)
    price: parseInt(item.price?.replace(/[^0-9]/g, "")) || 20,
    exact: true, // placeholder — will upgrade later
  }));

  // ========== FILTER STATE ==========
  const [sizes, setSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(60);
  const [quality, setQuality] = useState(null);

  // ========== FILTER LOGIC ==========
  const filtered = items.filter((item) => {
    if (sizes.length > 0 && !sizes.includes(item.size)) return false;
    if (maxPrice !== null && item.price > maxPrice) return false;
    if (quality && item.quality !== quality) return false;
    return true;
  });

  const exactMatches = filtered.filter((i) => i.exact);
  const similarItems = filtered.filter((i) => !i.exact);

  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="px-20 mt-10">
        {/* TOP SEARCH BAR */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-full shadow-md overflow-hidden w-[600px]">
            <div className="px-5 py-3 text-xl text-[#6c745f]">+</div>
            <input
              value={params.get("query") || ""}
              readOnly
              className="flex-1 px-2 outline-none text-lg"
            />
            <button className="bg-[#8b9275] px-6 text-white text-2xl">→</button>
          </div>
        </div>

        {/* FILTERS + MAIN PRODUCT HEADER */}
        <div className="flex gap-8">
          {/* FILTERS */}
          <div className="flex flex-col gap-4">
            {/* Size Filter */}
            <div className="bg-[#d6d9d0] p-4 rounded-xl shadow-sm w-40">
              <p className="font-semibold text-lg text-[#5d6551]">
                Filter by size
              </p>

              <SizeFilter selected={sizes} setSelected={setSizes} />
            </div>

            {/* Price Filter */}
            <div className="bg-[#d6d9d0] p-4 rounded-xl shadow-sm w-40">
              <p className="font-semibold text-lg text-[#5d6551]">
                Filter by price
              </p>
              <input
                type="range"
                min="5"
                max="200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-3 w-full"
              />
              <p className="mt-2 text-sm text-[#5d6551]">
                Max: ${maxPrice}
              </p>
            </div>

            {/* Quality Filter */}
            <div className="bg-[#d6d9d0] p-4 rounded-xl shadow-sm w-40">
              <p className="font-semibold text-lg text-[#5d6551]">
                Filter by quality
              </p>
              <div className="flex flex-col gap-2 mt-3">
                {["Excellent", "Good", "Fair"].map((q) => (
                  <button
                    key={q}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold
                      ${
                        quality === q
                          ? "bg-[#8b9275] text-white"
                          : "bg-[#e5e7de] text-[#5d6551]"
                      }
                    `}
                    onClick={() =>
                      setQuality(quality === q ? null : q)
                    }
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN PRODUCT HEADER */}
          <div className="flex-1">
            <div className="bg-[#d2b19c] px-6 py-5 rounded-xl shadow-sm w-[500px]">
              <div className="flex gap-5">
                <img
                  src={items[0]?.image || ""}
                  className="w-40 h-40 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-[#5d5148]">
                    {items[0]?.title || "Search Results"}
                  </h3>
                  <p className="text-[#5d5148] mt-2">
                    {items.length} results found
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EXACT MATCHES */}
        <SectionHeader title="Exact matches:" />
        <div className="flex flex-wrap gap-6">
          {exactMatches.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>

        {/* SIMILAR ITEMS */}
        <SectionHeader title="Similar items:" />
        <div className="flex flex-wrap gap-6 mb-20">
          {similarItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
