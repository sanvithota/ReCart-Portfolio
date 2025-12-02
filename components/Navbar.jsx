"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-[#e9e3d4] shadow-sm">

      {/* LOGO */}
      <Link href="/" className="flex items-center gap-3 group cursor-pointer">
        <Image 
          src="/recartlogo.png"
          alt="ReCart Logo"
          width={40}
          height={40}
          className="opacity-90 transition-transform group-hover:scale-105"
        />
        <span className="text-3xl font-semibold text-[#5d6551] tracking-tight">
          ReCart
        </span>
      </Link>

      {/* NAV LINKS + USER AREA */}
      <div className="flex items-center gap-8">
      
      
        <Link 
  href="/browse"
  className="text-[#5d6551] font-medium hover:text-[#3e4638] transition"
>
  Browse
</Link>

        {/* NEW NAV LINKS */}
        <Link 
          href="/impact" 
          className="text-[#5d6551] font-medium hover:text-[#3e4638] transition"
        >
          Impact
        </Link>

        <Link 
          href="/blog" 
          className="text-[#5d6551] font-medium hover:text-[#3e4638] transition"
        >
          Blog
        </Link>

        {/* AUTH AREA */}
        {!user ? (
          <Link
            href="/login"
            className="bg-[#d6d9d0] px-6 py-3 rounded-full text-[#5d6551] font-medium hover:bg-[#cfd2c8] transition"
          >
            Log in / Sign Up
          </Link>
        ) : (
          <div className="relative inline-block">
            <div className="group inline-block">

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#8b9275] text-white flex items-center justify-center cursor-pointer text-lg select-none transition hover:brightness-110">
                {user.user_metadata.fullname
                  ? user.user_metadata.fullname.charAt(0)
                  : "U"}
              </div>

              {/* Dropdown */}
              <div
                className="
                  absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg p-4 z-50
                  opacity-0 invisible transform transition-all duration-200
                  group-hover:opacity-100 group-hover:visible group-hover:translate-y-1
                "
              >
                <p className="font-semibold">
                  {user.user_metadata.fullname || "User"}
                </p>
                <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                <Link
                  href="/profile"
                  className="block py-1 text-[#5d6551] hover:underline"
                >
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="block py-1 text-[#5d6551] hover:underline"
                >
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-left w-full mt-2 text-red-600 hover:underline"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
