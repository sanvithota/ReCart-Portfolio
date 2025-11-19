"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function URLInput() {
  const [url, setUrl] = useState("");
  const router = useRouter();
  
  async function handleSubmit() {
    if (!url.trim()) return;
  
    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ query: url }),
    });
  
    const data = await res.json();
  
    router.push(`/browse?results=${encodeURIComponent(JSON.stringify(data.products))}&query=${url}`);
  }
  

  return (
    <div className="flex bg-white rounded-full shadow-md overflow-hidden">
      <div className="px-5 py-3 text-xl text-[#6c745f]">+</div>

      <input
        type="text"
        placeholder="https://www.example.com/product..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 px-2 outline-none text-lg text-[#555]"
      />

      <button
        onClick={handleSubmit}
        className="bg-[#8b9275] px-6 text-white text-2xl hover:bg-[#798062]"
      >
        →
      </button>
    </div>
  );
}
