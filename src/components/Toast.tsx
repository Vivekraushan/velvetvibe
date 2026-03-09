"use client";
export default function Toast({
  message,
  type = "info",
}: {
  message: string;
  type?: "success" | "error" | "info";
}) {
  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    info: "#333",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: colors[type],
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 10,
        fontSize: 14,
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
}