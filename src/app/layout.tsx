import type { Metadata } from "next";

import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "VelvetVibe",
  description: "Social platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
          <ToastProvider>
        <BottomNav />
        {children}
        </ToastProvider>
      </body>
    </html>
  );
};