import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-transparent">
      
      {/* Left - Logo */}
      <Link href="/" className="flex items-center gap-2">
        <img src="/recart-logo.svg" alt="ReCart" className="w-12" />
        <span className="text-2xl font-semibold text-[#5d6551]">ReCart</span>
      </Link>

      {/* Center links */}
      <div className="flex gap-10 text-xl font-semibold text-[#5d6551]">
        <Link href="/">Home</Link>
        <Link href="/browse">Browse</Link>
        <Link href="/impact">Impact</Link>
        <Link href="/contact">Contact</Link>
      </div>

      {/* Right - Login/Sign Up BUTTON (fixed) */}
      <Link
        href="/login"
        className="bg-[#d6d9d0] px-6 py-3 rounded-full text-lg font-semibold text-[#5d6551] hover:bg-[#c9ccc3] transition"
      >
        Log in/Sign Up
      </Link>
    </nav>
  );
}
