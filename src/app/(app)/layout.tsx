import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "../globals.css";

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

