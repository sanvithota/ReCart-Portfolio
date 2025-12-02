import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function ImpactPage() {
  return (
    <main className="min-h-screen bg-[#F7F4ED] text-[#2F3E34]">
      
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
            Our Impact
          </h1>
          <p className="text-lg text-[#445B48] max-w-2xl">
            Every item purchased second-hand reduces waste, carbon emissions,
            and unnecessary spending. Here&apos;s how ReCart users make a difference.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 animate-fade-in-slow">
          <div className="bg-[#E3E8DC] p-8 rounded-xl shadow-sm text-center">
            <p className="text-5xl font-bold text-[#445B48]">68%</p>
            <p className="mt-3 text-[#2F3E34]">Avg. money saved per purchase</p>
          </div>

          <div className="bg-[#E3E8DC] p-8 rounded-xl shadow-sm text-center">
            <p className="text-5xl font-bold text-[#445B48]">58 lbs</p>
            <p className="mt-3 text-[#2F3E34]">
              Textile waste diverted per user per year
            </p>
          </div>

          <div className="bg-[#E3E8DC] p-8 rounded-xl shadow-sm text-center">
            <p className="text-5xl font-bold text-[#445B48]">73%</p>
            <p className="mt-3 text-[#2F3E34]">
              Lower carbon footprint vs. buying new
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-20 grid md:grid-cols-2 gap-10 items-center animate-fade-in">
          <div>
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Why second-hand?
            </h2>
            <p className="text-[#445B48] leading-relaxed">
              The fashion industry produces over 92 million tons of waste each year.
              When you shop second-hand, you extend the life of clothing and help reduce
              demand for fast-fashion production. ReCart connects you with high-quality
              resale options so you can shop better — not more.
            </p>
          </div>

          <Image
            src="/impact-illustration.png"
            width={500}
            height={400}
            alt="Impact illustration"
            className="rounded-xl shadow-md"
          />
        </div>
      </section>
      {/* Disclaimer */}
    <p className="text-[11px] text-center text-[#7a7f72] mt-12 pb-6 opacity-70">
      *All environmental impact numbers displayed are estimates and are not exact measurements.
    </p>
    </main>
  );
}
