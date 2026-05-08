import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
              <nav className="flex items-center gap-5 text-sm">
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

          <footer className="border-t border-black/10">
            <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-neutral-600">
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
