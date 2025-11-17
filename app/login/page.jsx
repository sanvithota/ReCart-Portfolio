import Navbar from "@/components/Navbar";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="flex justify-center mt-20">
        <div className="bg-[#d2b19c] w-[450px] py-10 px-12 rounded-3xl shadow-md">
          <h1 className="text-3xl font-semibold text-white text-center">
            Welcome back to ReCart
          </h1>

          <p className="text-center text-white/90 mt-2 mb-6">
            Log in to continue shopping sustainably
          </p>

          {/* FORM */}
          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email Address"
              className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl outline-none text-lg"
            />

            <input
              type="password"
              placeholder="Password"
              className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl outline-none text-lg"
            />

            <button
              type="submit"
              className="mt-4 bg-[#8b9275] text-white text-xl py-3 rounded-xl hover:bg-[#798062] transition"
            >
              Log In
            </button>
          </form>

          <p className="mt-4 text-center text-[#5d5148] font-medium">
            Don’t have an account?{" "}
            <a href="/signup" className="underline">
              Create one here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
