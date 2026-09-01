"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useSubmissionStore } from "@/stores/submissionStore";

const PHASES = ["Tracing execution...", "Analyzing patterns...", "Generating narration..."];

export default function SubmissionPendingPage() {
  const router = useRouter();
  const status = useSubmissionStore((s) => s.status);
  const lessonId = useSubmissionStore((s) => s.lessonId);
  const error = useSubmissionStore((s) => s.error);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "completed" && lessonId) {
      router.replace(`/lessons/${lessonId}`);
    }
  }, [status, lessonId, router]);

  // Calling router.replace() directly in the render body (rather than an effect) crashes
  // Next's static prerendering of this route at build time with "ReferenceError: location is
  // not defined" -- prerendering runs in a Node sandbox with no browser globals, and the
  // synchronous navigation call reaches code that assumes one exists.
  useEffect(() => {
    if (status === "idle") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "idle") {
    return null;
  }

  const phase = PHASES[Math.min(Math.floor(elapsed / 8), PHASES.length - 1)];

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <GlassPanel className="w-full space-y-4 p-8">
        {status === "failed" ? (
          <>
            <p className="text-lg font-semibold text-red-400">Something went wrong</p>
            <p className="text-sm text-foreground/60">{error}</p>
            <button onClick={() => router.replace("/")} className="text-sm text-accent underline">
              Back to editor
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
            <p className="font-medium">{phase}</p>
            <p className="text-xs text-foreground/40">
              This runs on a local model on your machine -- it can take up to ~30-60s.
            </p>
            {elapsed > 20 && (
              <p className="text-xs text-foreground/40">Still working, thanks for your patience...</p>
            )}
          </>
        )}
      </GlassPanel>
    </main>
  );
}
