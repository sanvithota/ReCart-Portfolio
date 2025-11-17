"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function URLInput() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!url.trim()) return;
    router.push(`/browse?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="flex bg-white rounded-full shadow-md overflow-hidden">
      <div className="px-5 py-3 text-xl text-[#6c745f]">+</div>

      <input
        type="text"
        placeholder="https://www.pacsun.com/john-galt/..."
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
