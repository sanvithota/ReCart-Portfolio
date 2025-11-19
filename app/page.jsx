import Navbar from "@/components/Navbar";
import URLInput from "@/components/URLInput";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F4ED] text-[#2F3E34]">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-8 py-20">
        {/* Left Section */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold leading-tight text-[#2F3E34]">
            Find your next outfit <br />
            without costing the planet.
          </h1>

          <p className="text-lg md:text-xl text-[#445B48]">
            Shop smarter, save money, and help the Earth.
          </p>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
          <Image
            src="/clothing-rack.png"
            alt="Sustainable clothing rack"
            width={400}
            height={400}
            className="opacity-90"
          />
        </div>
      </section>

      {/* Full-width URL input */}
      <div className="w-full bg-[#F7F4ED] px-6 md:px-24 pb-20">
        <div className="w-full max-w-5xl mx-auto">
          <URLInput />
          <p className="text-center text-sm text-[#68735b] mt-3">
            Paste any clothing link to find second-hand options
          </p>
        </div>
      </div>
    </main>
  );
}
