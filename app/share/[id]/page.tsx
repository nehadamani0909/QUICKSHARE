"use client";

import { use, useEffect, useState } from "react";

type Share = {
  id: string;
  content: string | null;
  fileUrl: string | null;
  expiresAt: string;
  createdAt: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function SharePage({ params }: PageProps) {
  const { id } = use(params);
  const [share, setShare] = useState<Share | null>(null);
  const [error, setError] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadShare() {
      setIsLoading(true);
      setError("");
      setIsExpired(false);

      try {
        const response = await fetch(`/api/share/${id}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (response.status === 410) {
          setIsExpired(true);
          setShare(null);
          return;
        }

        if (!response.ok) {
          setError(data.error ?? "Share not found");
          setShare(null);
          return;
        }

        setShare(data);
      } catch {
        if (isMounted) {
          setError("Unable to load this share");
          setShare(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadShare();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fdf2d7_0%,#f7ebe2_35%,#dbe9f4_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[28px] border border-black/10 bg-white/85 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
            QuickShare
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">
            Shared content
          </h1>

          {isLoading && (
            <p className="mt-6 text-sm text-stone-600">Loading share...</p>
          )}

          {!isLoading && isExpired && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
              <p className="font-medium">Link expired</p>
              <p className="mt-2 text-sm">
                This share has passed its expiry time and is no longer
                available.
              </p>
            </div>
          )}

          {!isLoading && !isExpired && error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
              <p className="font-medium">We couldn&apos;t open this share.</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && !isExpired && share && (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Expires
                </p>
                <p className="mt-2 text-sm text-stone-700">
                  {new Date(share.expiresAt).toLocaleString()}
                </p>
              </div>

              {share.content && (
                <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Text
                  </p>
                  <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-stone-900">
                    {share.content}
                  </pre>
                </div>
              )}

              {share.fileUrl && (
                <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    File
                  </p>
                  <a
                    className="mt-3 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
                    href={share.fileUrl}
                    download
                  >
                    Download file
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
