"use client";

import { supabase } from "@/lib/supabase-client";
import { useEffect, useRef, useState } from "react";

type Post = {
  id: string;
  content_url: string;
  caption: string;
  likes: { user_id: string }[];
  comments: {
    id: string;
    text: string;
  }[];
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsInput, setCommentsInput] = useState<{ [key: string]: string }>({});
  const [user, setUser] = useState<any>(null);
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});
  const [showHeart, setShowHeart] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const lastTapRef = useRef<number>(0);

  // 🔥 Load user + posts
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      const res = await fetch("/api/posts/list");
      const dataPosts = await res.json();

      if (Array.isArray(dataPosts)) {
        setPosts(dataPosts);
      } else {
        setPosts([]);
      }

      setLoading(false);
    };

    init();
  }, []);

  // 🔥 LIKE / UNLIKE
  const handleLike = async (postId: string) => {
    if (!user) return;

    const res = await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    });

    const data = await res.json();

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        if (data.liked) {
          return {
            ...p,
            likes: [...(p.likes || []), { user_id: user.id }],
          };
        } else {
          return {
            ...p,
            likes: p.likes.filter((l) => l.user_id !== user.id),
          };
        }
      })
    );
  };

  // 🔥 COMMENT
  const handleComment = async (postId: string) => {
    if (!user) return;

    const text = commentsInput[postId];
    if (!text) return;

    await fetch("/api/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, text }),
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...(p.comments || []),
                { id: Date.now().toString(), text },
              ],
            }
          : p
      )
    );

    setCommentsInput((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  // 🔥 DOUBLE TAP
  const handleTap = (postId: string) => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      setShowHeart((prev) => ({ ...prev, [postId]: true }));

      setTimeout(() => {
        setShowHeart((prev) => ({ ...prev, [postId]: false }));
      }, 600);

      handleLike(postId);
    }

    lastTapRef.current = now;
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "30px auto",
        padding: 20,
        fontFamily: "system-ui, -apple-system",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 30 }}>
        Feed
      </h1>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="skeleton" style={{ height: 300 }} />
              <div className="skeleton" style={{ height: 20, marginTop: 10 }} />
            </div>
          ))}
        </div>
      ) : (
        posts.map((post) => {
          const isLiked = post.likes?.some(
            (l) => l.user_id === user?.id
          );

          return (
            <div
              key={post.id}
              style={{
                marginBottom: 30,
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {/* IMAGE */}
              <div
                onClick={() => handleTap(post.id)}
                style={{ position: "relative" }}
              >
                <img
                  src={post.content_url}
                  style={{ width: "100%", display: "block" }}
                />

                {showHeart[post.id] && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: 80,
                    }}
                  >
                    ❤️
                  </div>
                )}
              </div>

              <div style={{ padding: 12 }}>
                <p style={{ marginBottom: 6 }}>{post.caption}</p>

                {/* ACTIONS */}
                <div style={{ display: "flex", gap: 15 }}>
                  <span
                    onClick={() => handleLike(post.id)}
                    style={{
                      cursor: "pointer",
                      fontSize: 20,
                      transform: isLiked ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    {isLiked ? "❤️" : "🤍"}
                  </span>

                  <span
                    onClick={() =>
                      setOpenComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    style={{ cursor: "pointer", fontSize: 20 }}
                  >
                    💬
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                  {post.likes?.length || 0} likes
                </p>

                {/* COMMENTS */}
                {openComments[post.id] && (
                  <div style={{ marginTop: 10 }}>
                    {post.comments?.map((c) => (
                      <p key={c.id} style={{ fontSize: 13 }}>
                        {c.text}
                      </p>
                    ))}

                    <div style={{ display: "flex", marginTop: 6 }}>
                      <input
                        value={commentsInput[post.id] || ""}
                        onChange={(e) =>
                          setCommentsInput((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                        style={{ flex: 1, padding: 6 }}
                      />

                      <span
                        onClick={() => handleComment(post.id)}
                        style={{ cursor: "pointer", fontSize: 18 }}
                      >
                        📤
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}