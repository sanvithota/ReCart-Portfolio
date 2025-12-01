export default function ProductCard({ item }) {
  // Derive site label from the listing URL
  let siteLabel = "";
  try {
    if (item.link) {
      const url = new URL(item.link);
      siteLabel = url.hostname.replace(/^www\./, ""); // e.g. "poshmark.com"
    } else if (item.platform) {
      siteLabel = item.platform;
    }
  } catch (e) {
    siteLabel = item.platform || "";
  }

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

      {/* Title color – change this if you want a different text color */}
      <h3 className="mt-2 font-semibold text-[#535c48]">{item.title}</h3>

      {/* Price color – tweak here if you want */}
      <p className="text-[#5d6551]">${item.price}</p>

      {/* Site label from URL */}
      <p className="text-sm text-gray-500">{siteLabel}</p>
    </a>
  );
}
