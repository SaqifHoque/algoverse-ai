import { CodeSubmissionForm } from "@/components/submission/CodeSubmissionForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold tracking-tight">Algo<span className="text-accent">Verse</span></div>
        <ThemeToggle />
      </div>
      <div className="mx-auto mb-10 mt-14 max-w-3xl text-center">
        <div className="mx-auto mb-4 w-fit rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">Learn visually · Build confidently</div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Algo<span className="text-accent">Verse</span> AI
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground/55 sm:text-lg">
          Master data structures and algorithms one animated step at a time, or bring your own solution and let local AI turn it into a visual lesson.
        </p>
      </div>
      <CodeSubmissionForm />
      <footer className="py-10 text-center text-xs text-foreground/30">103 lessons · Python playground · Local AI powered</footer>
    </main>
  );
}
