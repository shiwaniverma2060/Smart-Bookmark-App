"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        fetchBookmarks(data.user.id);
      }
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

  const login = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  };

  const addBookmark = async () => {
    const title = (document.getElementById("title") as HTMLInputElement).value;
    const url = (document.getElementById("url") as HTMLInputElement).value;

    if (!title || !url) return;

    await supabase.from("bookmarks").insert([
      { title, url, user_id: user.id },
    ]);

    fetchBookmarks(user.id);
  };

  const filtered = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={
        dark
          ? "min-h-screen bg-zinc-900 text-white"
          : "min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
      }
    >
      
        {!user ? (
          <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
    
               {/* background glow */}
              <div className="absolute w-[600px] h-[600px] bg-white/10 blur-3xl rounded-full top-[-150px] left-[-150px]" />
              <div className="absolute w-[500px] h-[500px] bg-white/10 blur-3xl rounded-full bottom-[-120px] right-[-120px]" />

               {/* glass card */}
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 w-[420px] text-center text-white">
      
                <h1 className="text-3xl font-bold tracking-tight">
                      Smart Bookmark
                </h1>

                <p className="text-white/80 mt-2">
                    Save, organize, and access your favorite links anywhere.
                  </p>

                 {/* feature list */}
                 <div className="text-sm text-white/80 mt-6 space-y-2 text-left">
                    <div>✓ Google authentication</div>
                    <div>✓ Real-time sync</div>
                    <div>✓ Clean dashboard UI</div>
                    <div>✓ Fast bookmark access</div>
                  </div>

                 <button
                     onClick={login}
                     className="mt-8 w-full bg-black text-white py-3 rounded-xl font-medium shadow-lg hover:scale-[1.02] transition"
                    >
                      Continue with Google
                   </button>

                  <p className="text-xs text-white/60 mt-6">
                     Built with Next.js + Supabase
                    </p>
               </div>
           </div>

   ) : (
        <>
          {/* NAVBAR */}
          <header className="sticky top-0 bg-white/70 backdrop-blur border-b shadow-sm">
            <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Smart Bookmark
                </h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDark(!dark)}
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  {dark ? "Light" : "Dark"}
                </button>

                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="max-w-5xl mx-auto mt-8 px-6">
            {/* ADD BOOKMARK */}
            <div className="bg-white p-4 rounded-xl shadow-md flex gap-3 mb-6">
              <input
                id="title"
                placeholder="Bookmark title"
                className="border p-2 rounded w-full text-black"
              />
              <input
                id="url"
                placeholder="https://example.com"
                className="border p-2 rounded w-full text-black"
              />
              <button
                onClick={addBookmark}
                className="bg-blue-500 text-white px-4 rounded-lg"
              >
                Add
              </button>
            </div>

            {/* SEARCH */}
            <input
              placeholder="Search bookmarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full mb-6 text-black"
            />

            {/* EMPTY STATE */}
            {filtered.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                No bookmarks yet — add your first one 🚀
              </div>
            )}

            {/* BOOKMARK CARDS */}
            <div className="grid gap-4">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center"
                >
                  <div>
                    <a
                      href={b.url}
                      target="_blank"
                      className="text-blue-600 font-semibold"
                    >
                      {b.title}
                    </a>
                    <p className="text-gray-500 text-sm">{b.url}</p>
                  </div>

                  <button
                    onClick={async () => {
                      await supabase
                        .from("bookmarks")
                        .delete()
                        .eq("id", b.id);

                      fetchBookmarks(user.id);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
