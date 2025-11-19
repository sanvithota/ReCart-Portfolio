"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import SizeFilter from "@/components/SizeFilter";

export default function Browse() {
  const params = useSearchParams();

  // --- RAW RESULTS FROM API ---
  const results = JSON.parse(params.get("results") || "[]");

  // --- Convert API format to UI format ---
  const items = results.map((item, index) => ({
    id: index,
    title: item.title,
    image: item.thumbnail,
    platform: item.source,
    size: "M",
    quality: "Good",
    price: parseInt(item.price?.replace(/[^0-9]/g, "")) || 20,
    link: item.link,
    exact: true,
  }));

  // --- FILTER STATE ---
  const [sizes, setSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [quality, setQuality] = useState(null);

  // --- FILTERING LOGIC ---
  const filtered = items.filter((item) => {
    if (sizes.length > 0 && !sizes.includes(item.size)) return false;
    if (item.price > maxPrice) return false;
    if (quality && item.quality !== quality) return false;
    return true;
  });

  const exactMatches = filtered.filter((i) => i.exact);
  const similarItems = filtered.filter((i) => !i.exact);

  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="px-20 mt-10">
        {/* SEARCH BAR */}
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

        {/* PAGE LAYOUT */}
        <div className="flex gap-8">
          {/* LEFT FILTERS */}
          <div className="flex flex-col gap-4">
            {/* Sizes */}
            <div className="bg-[#d6d9d0] p-4 rounded-xl shadow-sm w-40">
              <p className="font-semibold text-lg text-[#5d6551]">
                Filter by size
              </p>
              <SizeFilter selected={sizes} setSelected={setSizes} />
            </div>

            {/* Price */}
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

            {/* Quality */}
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
                    onClick={() => setQuality(quality === q ? null : q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1">
            {/* MAIN PRODUCT HEADER */}
            <div className="bg-[#d2b19c] px-6 py-5 rounded-xl shadow-sm mb-6">
              <div className="flex gap-5">
                {items[0]?.image && (
                  <img
                    src={items[0].image}
                    alt=""
                    className="w-40 h-40 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-[#5d5148]">
                    {items[0]?.title || "Search Results"}
                  </h3>
                  <p className="text-[#5d5148] mt-2">
                    {filtered.length} results found
                  </p>
                </div>
              </div>
            </div>

            {/* EXACT MATCHES */}
            <SectionHeader title="Exact matches:" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exactMatches.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>

            {/* SIMILAR ITEMS */}
            <SectionHeader title="Similar items:" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
