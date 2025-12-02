"use client";

import URLInput from "@/components/URLInput";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import ConditionFilter from "@/components/ConditionFilter";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import SizeFilter from "@/components/SizeFilter";

export default function Browse() {
  const params = useSearchParams();

  // Raw results from API
  const results = JSON.parse(params.get("results") || "[]");
  const headerTitle = params.get("title") || "Search results";

  // Convert API format to UI format
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

  // Calculate dynamic price range from actual products
  const validPrices = items.map(i => i.price).filter(p => p > 0);
  const minProductPrice = validPrices.length > 0 ? Math.min(...validPrices) : 5;
  const maxProductPrice = validPrices.length > 0 ? Math.max(...validPrices) : 999;
  const defaultMaxPrice = Math.ceil(maxProductPrice / 10) * 10;

  // Filter state
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);
  const [selectedConditions, setSelectedConditions] = useState([]);

  // Filtering logic
  const filtered = items.filter((item) => {
    // Hide items with no price
    if (item.price <= 0) return false;

    // Hide sold items based on title
    const title = (item.title || "").toLowerCase();
    if (
      title.includes("sold out") ||
      title.includes("sold-out") ||
      title.includes("out of stock")
    ) {
      return false;
    }

    // Filter by size
    if (selectedSizes.length > 0) {
      if (item.sizes && item.sizes.length > 0) {
        const hasMatch = selectedSizes.some((selectedSize) =>
          item.sizes.includes(selectedSize)
        );
        if (!hasMatch) return false;
      } else {
        const hasMatch = selectedSizes.some((size) => {
          const sizePattern = new RegExp(`\\b${size}\\b`, 'i');
          return sizePattern.test(title);
        });
        if (!hasMatch) return false;
      }
    }

    // Filter by condition
    if (selectedConditions.length > 0) {
      if (!item.quality) return false;
      if (!selectedConditions.includes(item.quality)) return false;
    }

    // Filter by price
    if (item.price > maxPrice) return false;

    return true;
  });

  const exactMatches = filtered.filter((i) => i.exact);
  const similarItems = filtered.filter((i) => !i.exact);

  return (
    <main className="min-h-screen bg-[#f7f4ed]">
      <Navbar />

      <div className="px-20 mt-10">
        {/* SEARCH BAR */}
        <div className="w-full bg-[#f7f4ed] py-10 px-4">
          <div className="max-w-[900px] mx-auto">
            <URLInput initialUrl={params.get("query") || ""} />
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
              <SizeFilter selected={selectedSizes} setSelected={setSelectedSizes} />
            </div>

            {/* Price */}
            <div className="bg-[#d6d9d0] p-4 rounded-xl shadow-sm w-40">
              <p className="font-semibold text-lg text-[#5d6551]">
                Filter by price
              </p>
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

            {/* Condition */}
            <div className="bg-[#d6d9d0] p-4 rounded-xl shadow-sm w-40">
              <p className="font-semibold text-lg text-[#5d6551]">
                Filter by quality
              </p>
              <ConditionFilter
                selected={selectedConditions}
                setSelected={setSelectedConditions}
              />
            </div>

            {/* Clear Filters */}
            {(selectedSizes.length > 0 || selectedConditions.length > 0 || maxPrice !== defaultMaxPrice) && (
              <button
                onClick={() => {
                  setSelectedSizes([]);
                  setSelectedConditions([]);
                  setMaxPrice(defaultMaxPrice);
                }}
                className="bg-[#d6d9d0] p-3 rounded-xl shadow-sm text-[#5d6551] font-semibold hover:bg-[#c8cbc2] transition"
              >
                Clear All Filters
              </button>
            )}

            {/* Debug info */}
            <div className="bg-[#d6d9d0] p-3 rounded-xl shadow-sm text-xs text-[#5d6551]">
              <p className="font-semibold mb-1">Debug Info:</p>
              <p>{items.filter(i => i.sizes.length > 0).length} items have sizes</p>
              <p>{items.filter(i => i.quality).length} items have condition</p>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1">
            {/* MAIN PRODUCT HEADER */}
            <div className="bg-[#d2b19c] px-6 py-5 rounded-xl shadow-sm mb-6">
              <div className="flex gap-5">
                <div>
                  <h3 className="text-xl font-semibold text-[#5d5148]">
                    {headerTitle}
                  </h3>
                  <p className="text-[#5d5148] mt-2">
                    {filtered.length} results found
                  </p>
                </div>
              </div>
            </div>

            {/* EXACT MATCHES */}
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

            {/* SIMILAR ITEMS */}
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

            {/* No Results */}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#8b9275] text-lg">
                  No products match your filters. Try adjusting your selection.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}