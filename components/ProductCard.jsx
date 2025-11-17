export default function ProductCard({ item }) {
  return (
    <div className="bg-[#d8d3c4] p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer w-64">
      <img
        src={item.image}
        className="rounded-xl w-full h-56 object-cover"
      />

      <p className="mt-3 text-lg font-semibold text-[#5b5b5b] leading-tight">
        {item.title}
      </p>

      <div className="mt-1 text-sm font-semibold text-[#b62b2b] lowercase">
        {item.platform}
      </div>
    </div>
  );
}
