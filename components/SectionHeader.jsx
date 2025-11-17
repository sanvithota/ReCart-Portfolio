export default function SectionHeader({ title }) {
  return (
    <div className="mt-12 mb-4">
      <h2 className="bg-[#d7aa93] px-6 py-2 rounded-full inline-block text-xl font-semibold text-[#5d5148]">
        {title}
      </h2>
    </div>
  );
}
