import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import "../globals.css"; // or "../../globals.css" depending on your folder depth

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App Dashboard",
  description: "Main Application Layout",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

