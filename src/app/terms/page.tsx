"use client";

import { useEffect, useRef, useState } from "react";

type Post = {
  id: string;
  content_url: string;
  caption: string;
  type: string;
};

export default function TermsPage() {
  const [videos, setVideos] = useState<Post[]>([]);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [playing, setPlaying] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD VIDEOS
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/posts/list");
        const data = await res.json();

        if (Array.isArray(data)) {
          const onlyVideos = data.filter(
            (p: Post) => p.type === "video"
          );
          setVideos(onlyVideos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error(err);
        setVideos([]);
      }

      setLoading(false);
    };

    loadVideos();
  }, []);

  // 🔥 AUTOPLAY OBSERVER
  useEffect(() => {
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const id = video.dataset.id as string;

          if (entry.isIntersecting) {
            video.play();
            setPlaying((prev) => ({ ...prev, [id]: true }));
          } else {
            video.pause();
            setPlaying((prev) => ({ ...prev, [id]: false }));
          }
        });
      },
      { threshold: 0.7 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos]);

  // 🔥 TAP PLAY/PAUSE
  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying((prev) => ({ ...prev, [id]: true }));
    } else {
      video.pause();
      setPlaying((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        background: "black",
      }}
    >
      {/* 🧊 SKELETON */}
      {loading ? (
        <div className="skeleton" style={{ height: "100vh" }} />
      ) : videos.length === 0 ? (
        // 📭 EMPTY STATE
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            opacity: 0.6,
          }}
        >
          No videos yet
        </div>
      ) : (
        // 🎬 VIDEOS
        videos.map((video) => (
          <div
            key={video.id}
            style={{
              height: "100vh",
              scrollSnapAlign: "start",
              position: "relative",
            }}
          >
            {/* VIDEO */}
            <video
              ref={(el) => {
                videoRefs.current[video.id] = el;
              }}
              data-id={video.id}
              src={video.content_url}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              loop
              muted
              playsInline
              onClick={() => togglePlay(video.id)}
            />

            {/* PLAY ICON */}
            {!playing[video.id] && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 50,
                  color: "white",
                  opacity: 0.8,
                }}
              >
                ▶
              </div>
            )}

            {/* RIGHT ACTION COLUMN */}
            <div
              style={{
                position: "absolute",
                right: 10,
                bottom: 80,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                color: "white",
                fontSize: 22,
                alignItems: "center",
              }}
            >
              <div style={{ cursor: "pointer" }}>❤️</div>
              <div style={{ cursor: "pointer" }}>💬</div>
              <div style={{ cursor: "pointer" }}>🔗</div>
            </div>

            {/* CAPTION */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: 10,
                color: "white",
                maxWidth: "70%",
              }}
            >
              <p>{video.caption}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}