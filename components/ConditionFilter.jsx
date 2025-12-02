"use client";

export default function ConditionFilter({ selected, setSelected }) {
  const conditions = ["New", "Like New", "Good", "Fair"];

  return (
    <div className="flex flex-col gap-2 mt-3">
      {conditions.map((condition) => (
        <button
          key={condition}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition
            ${
              selected.includes(condition)
                ? "bg-[#8b9275] text-white"
                : "bg-[#e5e7de] text-[#5d6551] hover:bg-[#d8dccf]"
            }
          `}
          onClick={() => {
            if (selected.includes(condition)) {
              setSelected(selected.filter((c) => c !== condition));
            } else {
              setSelected([...selected, condition]);
            }
          }}
        >
          {condition}
        </button>
      ))}
    </div>
  );
}