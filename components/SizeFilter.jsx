"use client";

export default function SizeFilter({ selected, setSelected }) {
  const sizes = ["XS", "S", "M", "L", "XL", "2X", "3X"];

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {sizes.map((size) => (
        <button
          key={size}
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition
            ${
              selected.includes(size)
                ? "bg-[#8b9275] text-white"
                : "bg-[#e5e7de] text-[#5d6551] hover:bg-[#d8dccf]"
            }
          `}
          onClick={() => {
            if (selected.includes(size)) {
              setSelected(selected.filter((s) => s !== size));
            } else {
              setSelected([...selected, size]);
            }
          }}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
