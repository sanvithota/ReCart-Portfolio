"use client";

import URLInput from "@/components/URLInput";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import ConditionFilter from "@/components/ConditionFilter";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import SizeFilter from "@/components/SizeFilter";
import Image from "next/image";

export default function Browse() {
  const params = useSearchParams();

  // 1️⃣ ALL HOOKS COME FIRST — ALWAYS
  const [loadingSplash, setLoadingSplash] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [maxPrice, setMaxPrice] = useState(999);

  // Splash timeout
  useEffect(() => {
    const timer = setTimeout(() => setLoadingSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // 2️⃣ SAFE TO READ PARAMS + COMPUTE AFTER HOOKS
  const results = JSON.parse(params.get("results") || "[]");
  const headerTitle = params.get("title") || "Search results";

  const items = results.map((item, index) => {
    const match = item.price ? String(item.price).match(/[\d,.]+/) : null;
    const priceString = match ? match[0] : "0";

    return {
      id: index,
      title: item.title,
      image: item.thumbnail,
      platform: item.source,
      sizes: item.sizes || [],
      quality: item.condition || null,
      price: parseFloat(priceString.replace(/,/g, "")) || 0,
      link: item.link,
      exact: item.exact ?? true,
    };
  });

  // Compute price range safely
  const validPrices = items.map(i => i.price).filter(p => p > 0);
  const minProductPrice = validPrices.length ? Math.min(...validPrices) : 5;
  const maxProductPrice = validPrices.length ? Math.max(...validPrices) : 999;
  const defaultMaxPrice = Math.ceil(maxProductPrice / 10) * 10;

  useEffect(() => {
    setMaxPrice(defaultMaxPrice);
  }, [defaultMaxPrice]);

  // Filtering
  const filtered = items.filter(item => {
    if (item.price <= 0) return false;

    const title = (item.title || "").toLowerCase();
    if (title.includes("sold out") || title.includes("out of stock")) return false;

    if (selectedSizes.length > 0) {
      const hasMatch =
        item.sizes.some(s => selectedSizes.includes(s)) ||
        selectedSizes.some(size => new RegExp(`\\b${size}\\b`, "i").test(title));

      if (!hasMatch) return false;
    }

    if (selectedConditions.length > 0) {
      if (!item.quality) return false;
      if (!selectedConditions.includes(item.quality)) return false;
    }

    if (item.price > maxPrice) return false;

    return true;
  });

  const exactMatches = filtered.filter(i => i.exact);
  const similarItems = filtered.filter(i => !i.exact);

  // 3️⃣ SPLASH CAN NOW BE CONDITIONAL (HOOK ORDER SAFE)
  if (loadingSplash) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7F4ED]">
        <div className="text-center animate-fade-in">
          <Image src="/recartlogo.png" alt="ReCart" width={90} height={90} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold text-[#2F3E34]">ReCart</h1>
          <p className="mt-2 text-lg text-[#5f6d53]">Sustainable shopping, simplified.</p>

          <div className="flex justify-center gap-2 mt-6">
            <div className="w-3 h-3 bg-[#8b9275] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#8b9275] rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-[#8b9275] rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </main>
    );
  }

  // 4️⃣ NORMAL PAGE
  return (
    <main className="min-h-screen bg-[#f7f4ed]">
      <Navbar />

      {/* SEARCH BAR */}
      <div className="w-full bg-[#f7f4ed] py-10 px-4">
        <div className="max-w-[900px] mx-auto">
          <URLInput initialUrl={params.get("query") || ""} />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex gap-10 pb-24">
        {/* FILTERS */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 space-y-6">
          <div className="bg-[#d6d9d0] p-5 rounded-xl shadow-sm">
            <p className="font-semibold text-lg text-[#5d6551]">Filter by size</p>
            <SizeFilter selected={selectedSizes} setSelected={setSelectedSizes} />
          </div>

          <div className="bg-[#d6d9d0] p-5 rounded-xl shadow-sm">
            <p className="font-semibold text-lg text-[#5d6551]">Filter by price</p>
            <input
              type="range"
              min={Math.floor(minProductPrice)}
              max={Math.ceil(maxProductPrice)}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full"
            />
            <p className="mt-2 text-sm text-[#5d6551]">Max: ${maxPrice}</p>
          </div>

          <div className="bg-[#d6d9d0] p-5 rounded-xl shadow-sm">
            <p className="font-semibold text-lg text-[#5d6551]">Filter by quality</p>
            <ConditionFilter selected={selectedConditions} setSelected={setSelectedConditions} />
          </div>
        </aside>

        {/* RESULTS */}
        <div className="flex-1">
          <div className="bg-[#d2b19c] px-6 py-5 rounded-xl shadow-sm mb-6">
            <h3 className="text-xl font-semibold text-[#5d5148]">{headerTitle}</h3>
            <p className="text-[#5d5148] mt-2">{filtered.length} results found</p>
          </div>

          {/* Exact */}
          {exactMatches.length > 0 && (
            <>
              <SectionHeader title="Exact matches:" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {exactMatches.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}

          {/* Similar */}
          {similarItems.length > 0 && (
            <>
              <SectionHeader title="Similar items:" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
