"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const router = useRouter();

  // 🔥 preview
  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 🔥 upload
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // fake smooth progress
    let fake = 0;
    const interval = setInterval(() => {
      fake += Math.random() * 15;
      if (fake > 90) fake = 90;
      setProgress(Math.floor(fake));
    }, 300);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const filePath = `${user?.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("posts")
      .upload(filePath, file);

    clearInterval(interval);

    if (error) {
  setUploading(false);
  setToast("Upload failed");

  setTimeout(() => setToast(null), 2000);
  return;
}

    setProgress(100);

    const { data } = supabase.storage
      .from("posts")
      .getPublicUrl(filePath);

    const isVideo = file.type.startsWith("video");

    await fetch("/api/posts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content_url: data.publicUrl,
        caption,
        type: isVideo ? "video" : "image",
      }),
    });

    setTimeout(() => {
      setSuccess(true);
      setUploading(false);
    }, 400);

    setTimeout(() => {
      router.push("/feed");
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 500, margin: "20px auto", padding: 16, paddingBottom: 80 }}>
      
      
      {/* 🔥 SKELETON LOADING */}
      {uploading && (
        <div
          style={{
            height: 400,
            borderRadius: 16,
            background: "rgba(255,255,255,0.05)",
            overflow: "hidden",
            position: "relative",
            marginBottom: 16,
          }}
        >
          {/* shimmer */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              animation: "shimmer 1.2s infinite",
            }}
          />

          {/* progress bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 4,
              width: `${progress}%`,
              background: "#fff",
            }}
          />
        </div>
      )}

      {/* 🔥 NORMAL UI */}
      {!uploading && (
        <>
          {/* PREVIEW */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              height: 400,
              borderRadius: 16,
              background: "rgba(255,255,255,0.05)",
              border: "1px dashed rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {!preview ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ opacity: 0.5 }}>Drag & drop</p>

                <label style={{ cursor: "pointer" }}>
                  Select
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      e.target.files && handleFile(e.target.files[0])
                    }
                  />
                </label>
              </div>
            ) : file?.type.startsWith("video") ? (
              <video
                src={preview}
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img
                src={preview}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          {/* CAPTION */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              marginBottom: 16,
            }}
          />

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
            }}
          >
            Post
          </button>
        </>
      )}

      {/* ✅ SUCCESS FEEDBACK */}
      {success && (
        <p style={{ textAlign: "center", marginTop: 10, opacity: 0.7 }}>
          Posted successfully
        </p>
      )}
      {toast && <Toast message={toast} />}
      
    </div>
  );
}