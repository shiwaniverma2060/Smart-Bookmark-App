"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [dark, setDark] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // theme init (persisted)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // init auth+bookmarks
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) fetchBookmarks(data.user.id);
    };
    init();
  }, []);

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const addBookmark = async () => {
    if (!title.trim() || !url.trim()) return;
    setLoading(true);
    await supabase.from("bookmarks").insert([{ title: title.trim(), url: url.trim(), user_id: user.id }]);
    setTitle("");
    setUrl("");
    await fetchBookmarks(user.id);
    setLoading(false);
  };

  const removeBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    if (user) fetchBookmarks(user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const filtered = bookmarks.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 dark:from-zinc-900 dark:to-zinc-950 transition">
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 border-b bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Bookmark</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-md bg-gray-200 dark:bg-zinc-800 hover:scale-105 transition"
            >
              {dark ? "Light" : "Dark"}
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:brightness-90 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* add row */}
        <div className="bg-white dark:bg-zinc-900/70 shadow-lg rounded-2xl p-4 flex gap-3 items-center">
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bookmark title"
            className="flex-1 px-4 py-3 rounded-lg border dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
          />

          <input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-3 rounded-lg border dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
          />

          <button
            onClick={addBookmark}
            disabled={loading}
            className="px-5 py-3 rounded-lg bg-blue-600 text-white shadow hover:scale-[1.02] transition disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>

        {/* search */}
        <div className="mt-6">
          <input
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-white placeholder:text-gray-400 shadow"
          />
        </div>

        {/* bookmark list */}
        <div className="mt-8 space-y-4">
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 dark:text-zinc-400 py-8">No bookmarks yet — add your first one 🚀</div>
          )}

          {filtered.map((b) => (
            <article
              key={b.id}
              className="flex justify-between items-center bg-white dark:bg-zinc-900/70 p-4 rounded-2xl shadow hover:shadow-xl transition"
            >
              <div className="min-w-0">
                <a
                  className="block text-blue-600 dark:text-blue-400 font-semibold truncate"
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {b.title}
                </a>
                <div className="text-xs text-gray-500 dark:text-zinc-400 truncate">{b.url}</div>
              </div>

              <div className="flex items-center gap-3">
                {/* future: edit button */}
                <button
                  onClick={() => removeBookmark(b.id)}
                  className="px-3 py-1 rounded-md bg-red-500 text-white hover:brightness-90 transition"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
