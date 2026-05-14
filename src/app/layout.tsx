import type { Metadata } from "next";
import { Barlow, Bebas_Neue } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
// WordPress core block styles. Loaded before our own SCSS so brand
// overrides in `globals.scss` win the cascade.
import "@wordpress/block-library/build-style/style.css";
import "@wordpress/block-library/build-style/theme.css";
import "./globals.scss";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Headless WordPress Business Site",
    template: "%s | Headless WordPress Business Site",
  },
  description: "Business website frontend built with Next.js and WordPress.",
  openGraph: {
    title: "Headless WordPress Business Site",
    description: "Business website frontend built with Next.js and WordPress.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${barlow.variable} ${bebasNeue.variable} antialiased`}
      >
        <div className="min-h-screen bg-white text-neutral-900">
          <header className="bg-brand-yellow border-b border-black/10">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
              >
                <Image
                  src="/images/ownit-logo.svg"
                  alt="Own It"
                  width={160}
                  height={48}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
              <nav className="flex items-center gap-5 text-lg font-bold uppercase text-black">
                <Link href="/" className="hover:underline underline-offset-4">
                  Home
                </Link>
                <Link
                  href="/about"
                  className="hover:underline underline-offset-4"
                >
                  About
                </Link>
                <Link
                  href="/be-counted"
                  className="hover:underline underline-offset-4"
                >
                  Be Counted
                </Link>
                <Link
                  href="/services"
                  className="hover:underline underline-offset-4"
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  className="hover:underline underline-offset-4"
                >
                  Contact
                </Link>
              </nav>
            </div>
          </header>

          {children}

          <footer className="bg-[#3764E5] text-white">
            <div className="mx-auto max-w-5xl px-6 py-6 text-xs">
              <p>
                {new Date().getFullYear()} Headless Business Site. Built with
                Next.js + WordPress.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
