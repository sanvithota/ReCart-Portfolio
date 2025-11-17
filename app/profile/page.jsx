"use client";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="max-w-xl mx-auto mt-20 bg-white shadow p-10 rounded-2xl">
        <h1 className="text-3xl mb-6 font-bold">Your Profile</h1>

        <p><strong>Name:</strong> {user.user_metadata.fullname}</p>
        <p className="mt-2"><strong>Email:</strong> {user.email}</p>
      </div>
    </main>
  );
}
