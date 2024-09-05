import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "@next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})





export const metadata: Metadata = {
  title: "Volt - Your Job Tracker",
  description: "Personalized Job Tracker - Never miss a opportunity again!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
