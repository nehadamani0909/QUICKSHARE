"use client";

import React, { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [expiry, setExpiry] = useState("10");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLink("");
    setCopyState("idle");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("expiry", expiry);

      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/share", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Unable to create share link");
        return;
      }

      const absoluteLink = new URL(data.link, window.location.origin).toString();
      setLink(absoluteLink);
    } catch {
      setError("Unable to create share link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f5efe6_0%,#d7e7f5_48%,#f9d8c4_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <form
          className="w-full max-w-2xl rounded-[28px] border border-black/10 bg-white/85 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur"
          onSubmit={handleSubmit}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
            QuickShare
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-stone-900">
            Share text fast with a link that expires when you want it to.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
            Paste text or upload a file, choose how long it should stay
            available, and generate a one-time shareable link.
          </p>

          <label className="mt-8 block">
            <span className="mb-2 block text-sm font-medium text-stone-700">
              Text
            </span>
            <textarea
              placeholder="Paste text here..."
              className="min-h-56 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-stone-700">
              File upload
            </span>
            <input
              type="file"
              className="w-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-2 text-xs text-stone-500">
              Add text, a file, or both. Files are uploaded to Cloudinary.
            </p>
          </label>

          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">
                Expiry
              </span>
              <select
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              >
                <option value="10">10 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">1 day</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-auto rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isSubmitting ? "Creating link..." : "Create Share Link"}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {link && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              <p className="font-medium">Your share link is ready.</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                <a
                  className="min-w-0 flex-1 break-all rounded-2xl border border-emerald-200 bg-white px-3 py-3 font-mono text-xs text-emerald-900 underline decoration-emerald-300 underline-offset-4"
                  href={link}
                >
                  {link}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Copy link
                </button>
              </div>
              {copyState === "copied" && (
                <p className="mt-3 text-xs text-emerald-800">
                  Link copied to your clipboard.
                </p>
              )}
              {copyState === "failed" && (
                <p className="mt-3 text-xs text-red-700">
                  Could not copy automatically. You can still copy the link
                  above.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
