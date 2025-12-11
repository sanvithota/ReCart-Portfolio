"use client";

import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/"; // redirect to home
    }
  }

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl outline-none text-lg"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl outline-none text-lg"
            />

            {error && (
              <p className="text-red-700 text-center font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="mt-4 bg-[#8b9275] text-white text-xl py-3 rounded-xl hover:bg-[#798062] transition"
            >
              {loading ? "Logging in..." : "Log In"}
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
