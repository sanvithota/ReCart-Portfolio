"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import SizeFilter from "@/components/SizeFilter";

// TEMP DEMO DATA — replace with scraped data later
const items = [
  {
    id: 1,
    title: "John Galt Erica Boston Crew Neck Sweatshirt",
    image:
      "https://i.ebayimg.com/images/g/3kMAAOSw~/s-l1600.jpg",
    platform: "eBay",
    size: "M",
    quality: "Excellent",
    price: 35,
    exact: true,
  },
  {
    id: 2,
    title: "Brandy Melville Women's Grey and Green Hoodie",
    image:
      "https://i.ebayimg.com/images/g/AAAAA/s-l500.jpg",
    platform: "depop",
    size: "L",
    quality: "Good",
    price: 28,
    exact: true,
  },
  {
    id: 3,
    title: "Brandy Melville Women's Grey and Cream Sweatshirt",
    image:
      "https://i.ebayimg.com/images/g/BBBBB/s-l500.jpg",
    platform: "depop",
    size: "S",
    quality: "Fair",
    price: 22,
    exact: true,
  },
  {
    id: 4,
    title: "Brandy Melville Women's Cream and Green Sweatshirt",
    image:
      "https://i.ebayimg.com/images/g/CCCCCC/s-l500.jpg",
    platform: "depop",
    size: "M",
    quality: "Excellent",
    price: 30,
    exact: false,
  },
  {
    id: 5,
    title: "PacSun Boston Tan Sweater",
    image:
      "https://i.ebayimg.com/images/g/DDDDD/s-l500.jpg",
    platform: "poshmark",
    size: "L",
    quality: "Good",
    price: 27,
    exact: false,
  },
  {
    id: 6,
    title: "Brandy Melville Gray Boston Sweater",
    image:
      "https://i.ebayimg.com/images/g/EEEEE/s-l500.jpg",
    platform: "poshmark",
    size: "XL",
    quality: "Fair",
    price: 24,
    exact: false,
  },
];

export default function Browse() {
  const params = useSearchParams();
  const productUrl = params.get("url");

  const [sizes, setSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null);
  const [quality, setQuality] = useState(null);

  // CLIENT-SIDE FILTERING
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
      <Navbar user="Jane Doe" />

      <div className="px-20 mt-10">
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-full shadow-md overflow-hidden w-[600px]">
            <div className="px-5 py-3 text-xl text-[#6c745f]">+</div>
            <input
              value={productUrl || ""}
              readOnly
              className="flex-1 px-2 outline-none text-lg"
            />
            <button className="bg-[#8b9275] px-6 text-white text-2xl">→</button>
          </div>
        </div>

        {/* FILTERS + MAIN PRODUCT CARD */}
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
                min="10"
                max="60"
                value={maxPrice || 60}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-3 w-full"
              />
              <p className="mt-2 text-sm text-[#5d6551]">
                Max: ${maxPrice || 60}
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

          {/* MAIN PRODUCT DISPLAY */}
          <div className="flex-1">
            <div className="bg-[#d2b19c] px-6 py-5 rounded-xl shadow-sm w-[500px]">
              <div className="flex gap-5">
                <img
                  src="https://images.pacsun.com/is/image/Pacsun/0380462000080NEWSTONE?..."
                  className="w-40 h-40 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-[#5d5148]">
                    John Galt Boston Erica Crew Neck Sweatshirt
                  </h3>
                  <p className="text-[#5d5148] mt-2">200 results</p>
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
