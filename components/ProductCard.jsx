export default function ProductCard({ item }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl shadow p-3 hover:shadow-lg transition"
    >
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-48 object-cover rounded-lg"
      />

      <h3 className="mt-2 font-semibold">{item.title}</h3>
      <p className="text-[#5d6551]">${item.price}</p>
      <p className="text-sm text-gray-500">{item.platform}</p>
    </a>
  );
}

