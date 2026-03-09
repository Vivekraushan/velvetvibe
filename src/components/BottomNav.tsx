"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { path: "/feed", icon: "🏠" },
    { path: "/terms", icon: "⭐" }, // neuron vibe
    { path: "/upload", icon: "➕" },
    { path: "/profile", icon: "👤" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: 500,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
       paddingBottom: 80,
        borderRadius: 20,
        background: "rgba(36, 30, 30, 0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        zIndex: 1000,
      }}
    >
      {navItems.map((item) => {
        const active = pathname === item.path;

        return (
          <div
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              cursor: "pointer",
              fontSize: 22,
              opacity: active ? 1 : 0.5,
              transform: active ? "scale(1.2)" : "scale(1)",
              transition: "0.2s",
            }}
          >
            {item.icon}
          </div>
        );
      })}
    </div>
  );
}