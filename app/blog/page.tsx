import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function BlogPage() {
  const posts = [
    
    {
      title: "How to Build a Capsule Wardrobe for Under $200",
      desc: "A complete breakdown of how to build a timeless, minimalist wardrobe without overspending.",
      image: "/blog/capsule.png",
      read: "8 MIN READ",
      slug: "capsule-wardrobe",
    },
    {
      title: "The Best Places to Thrift Online in 2025",
      desc: "From Depop to Poshmark, here are this year's top platforms for scoring second-hand gems.",
      image: "/blog/thrift-online.jpg",
      read: "7 MIN READ",
      slug: "thrift-online",
    },
    {
      title: "The Science of Dupe Hunting: Spotting High-Quality Second-Hand Finds",
      desc: "How resellers evaluate fabric, stitching, and wear — and how you can too.",
      image: "/blog/dupe-hunting.jpg",
      read: "6 MIN READ",
      slug: "dupe-hunting-guide",
    },
    {
      title: "Inside the Resale Boom: Why Gen Z Is Reshaping the Market",
      desc: "A deep dive into the culture, values, and tech trends driving a global resale surge.",
      image: "/blog/gen-z-resale.jpg",
      read: "9 MIN READ",
      slug: "gen-z-resale",
    },

  ];

  return (
    <main className="bg-[#F7F4ED] min-h-screen text-[#2F3E34]">

      {/* NAVBAR */}
      <Navbar />

      {/* Featured Post */}
      <section className="max-w-6xl mx-auto px-6 py-12">

        <Link href={`/blog/${posts[0].slug}`}>
          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-lg group">
            <Image
              src={posts[0].image}
              alt={posts[0].title}
              fill
              className="object-cover group-hover:scale-105 transition"
            />

            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-6">
              <h1 className="text-white text-4xl md:text-5xl font-bold max-w-3xl mb-4">
                {posts[0].title}
              </h1>
              <p className="text-white/90 max-w-xl">
                {posts[0].desc}
              </p>
              <span className="mt-4 bg-white/80 text-[#2F3E34] px-4 py-2 rounded-full text-sm font-semibold">
                {posts[0].read}
              </span>
            </div>
          </div>
        </Link>

        {/* Recent Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {posts.slice(1).map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-[#2F3E34]">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </section>
    </main>
  );
}
