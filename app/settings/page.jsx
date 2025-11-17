"use client";

import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");

  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setFullname(data.user.user_metadata.fullname || "");
        setEmail(data.user.email);
      }
    }
    loadUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  async function updateName() {
    setMessage("");
    const { error } = await supabase.auth.updateUser({
      data: { fullname },
    });

    setMessage(error ? error.message : "Name updated successfully!");
  }

  async function updateEmail() {
    setMessage("");
    const { error } = await supabase.auth.updateUser({
      email,
    });

    setMessage(error ? error.message : "Check your inbox to confirm email change.");
  }

  async function updatePassword() {
    setMessage("");
    if (passwordNew.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordNew,
    });

    setMessage(error ? error.message : "Password updated successfully!");
  }

  async function deleteAccount() {
    setMessage("");

    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account deleted. Redirecting...");
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#e9e3d4]">
      <Navbar />

      <div className="max-w-2xl mx-auto mt-16 bg-white p-10 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-[#5d6551]">Account Settings</h1>

        {/* STATUS MESSAGE */}
        {message && (
          <p className="mb-6 text-center text-[#5d5148] font-semibold">
            {message}
          </p>
        )}

        {/* NAME */}
        <div className="mb-8">
          <label className="block mb-2 text-[#5d5148] font-medium">Full Name</label>
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl w-full"
          />
          <button
            onClick={updateName}
            className="mt-3 bg-[#8b9275] text-white px-5 py-2 rounded-xl hover:bg-[#798062]"
          >
            Update Name
          </button>
        </div>

        {/* EMAIL */}
        <div className="mb-8">
          <label className="block mb-2 text-[#5d5148] font-medium">Email</label>
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl w-full"
          />
          <button
            onClick={updateEmail}
            className="mt-3 bg-[#8b9275] text-white px-5 py-2 rounded-xl hover:bg-[#798062]"
          >
            Update Email
          </button>
        </div>

        {/* PASSWORD */}
        <div className="mb-8">
          <label className="block mb-2 text-[#5d5148] font-medium">New Password</label>
          <input
            type="password"
            placeholder="New Password"
            value={passwordNew}
            onChange={(e) => setPasswordNew(e.target.value)}
            className="bg-[#d6d9d0] text-[#5d6551] px-4 py-3 rounded-xl w-full"
          />

          <button
            onClick={updatePassword}
            className="mt-3 bg-[#8b9275] text-white px-5 py-2 rounded-xl hover:bg-[#798062]"
          >
            Change Password
          </button>
        </div>

        {/* DELETE ACCOUNT */}
        <div className="mt-10">
          <button
            onClick={deleteAccount}
            className="text-red-600 font-semibold underline"
          >
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}
