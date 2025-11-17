import Navbar from "@/components/Navbar";
import URLInput from "@/components/URLInput";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="flex flex-col items-center mt-24">
        <img src="/recart-logo.svg" className="w-40 opacity-90" />

        <h1 className="mt-4 text-5xl font-semibold text-[#68735b]">ReCart</h1>

        <p className="mt-2 text-xl text-[#5f6553]">
          Sustainable Shopping, Simplified.
        </p>

        <div className="mt-10 w-[600px]">
          <URLInput />
        </div>
      </div>
    </main>
  );
}
