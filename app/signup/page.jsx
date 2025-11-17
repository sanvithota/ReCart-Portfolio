"use client";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const fullname = formData.get("fullname");
    const email = formData.get("email");
    const password = formData.get("password");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { fullname }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/login";
    }
  }

  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="flex justify-center mt-20">
        <div className="bg-[#d2b19c] w-[450px] py-10 px-12 rounded-3xl">
          <h1 className="text-3xl font-semibold text-white text-center">
            Join the ReCart Community
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <input name="fullname" placeholder="Full Name" required className="..." />
            <input name="email" type="email" placeholder="Email Address" required className="..." />
            <input name="password" type="password" placeholder="Password" required className="..." />

            {error && <p className="text-red-700 text-center">{error}</p>}

            <button className="bg-[#8b9275] py-3 text-white rounded-xl">
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
