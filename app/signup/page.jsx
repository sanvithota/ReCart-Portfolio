import Navbar from "@/components/Navbar";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="flex justify-center mt-20">
        <div className="bg-[#d2b19c] w-[450px] py-10 px-12 rounded-3xl shadow-md">
          <h1 className="text-3xl font-semibold text-white text-center">
            Join the ReCart Community
          </h1>

          <p className="text-center text-white/90 mt-2 mb-6">
            Shop sustainably and track your impact
          </p>

          {/* FORM */}
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl outline-none text-lg"
            />

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

            <input
              type="password"
              placeholder="Confirm Password"
              className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl outline-none text-lg"
            />

            <button
              type="submit"
              className="mt-4 bg-[#8b9275] text-white text-xl py-3 rounded-xl hover:bg-[#798062] transition"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-4 text-center text-[#5d5148] font-medium">
            Already have an account?{" "}
            <a href="/login" className="underline">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
