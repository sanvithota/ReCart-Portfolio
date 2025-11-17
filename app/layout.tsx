import "./globals.css";

export const metadata = {
  title: "ReCart",
  description: "Sustainable Shopping, Simplified.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#e9e3d4]">
        {children}
      </body>
    </html>
  );
}
