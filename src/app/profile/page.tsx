"use client";

import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  content_url: string;
  caption: string;
  type: string;
  user_id: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "terms">("posts");

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/");
        return;
      }

      setUser(data.user);

      // 🔥 get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setProfile(profileData);

      // 🔥 get posts
      const res = await fetch("/api/posts/list");
      const allPosts = await res.json();

      const userPosts = allPosts.filter(
        (p: Post) => p.user_id === data.user.id
      );

      setPosts(userPosts);
    };

    init();
  }, []);

  // 🔥 avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    const filePath = `${user.id}/${Date.now()}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (error) {
      setToast("Something went wrong");
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);

    setProfile((prev: any) => ({
      ...prev,
      avatar_url: data.publicUrl,
    }));
  };

  // 🔥 update profile
  const updateProfile = async () => {
    if (!profile) {
  return (
    <div style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 100, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 300 }} />
    </div>
  );
}

    await supabase
      .from("profiles")
      .update({
        username: profile.username,
        bio: profile.bio,
      })
      .eq("id", user.id);

    setToast("Profile updated");
  };

  // 🔥 logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // 🚨 prevent crash before data loads
  if (!profile) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 500, margin: "20px auto", padding: 16, paddingBottom: 80 }}>
      
      {/* PROFILE CARD */}
      <div
        style={{
          padding: 16,
          borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 20,
        }}
      >
        {/* AVATAR */}
        <img
          src={profile.avatar_url || "https://via.placeholder.com/80"}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 10,
          }}
        />

        <input
          type="file"
          onChange={(e) =>
            e.target.files && handleAvatarUpload(e.target.files[0])
          }
        />

        {/* USERNAME */}
        <input
          value={profile.username || ""}
          onChange={(e) =>
            setProfile({ ...profile, username: e.target.value })
          }
          placeholder="Username"
          style={{ width: "100%", marginTop: 10, padding: 6 }}
        />

        {/* BIO */}
        <textarea
          value={profile.bio || ""}
          onChange={(e) =>
            setProfile({ ...profile, bio: e.target.value })
          }
          placeholder="Bio"
          style={{ width: "100%", marginTop: 8, padding: 6 }}
        />

        <button onClick={updateProfile} style={{ marginTop: 10 }}>
          Save
        </button>

        <button onClick={handleLogout} style={{ marginTop: 10 }}>
          Logout
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setActiveTab("posts")}>Posts</button>
        <button onClick={() => setActiveTab("terms")}>Terms</button>
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {posts
          .filter((p) =>
            activeTab === "posts"
              ? p.type === "image"
              : p.type === "video"
          )
          .map((post) => (
            <div key={post.id}>
              {post.type === "image" ? (
                <img
                  src={post.content_url}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <video
                  src={post.content_url}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                  }}
                  muted
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}