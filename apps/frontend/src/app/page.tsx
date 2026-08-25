import { CodeSubmissionForm } from "@/components/submission/CodeSubmissionForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-16">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Algo<span className="text-accent">Verse</span> AI
        </h1>
        <p className="mt-3 text-foreground/60">
          Paste an algorithm. Watch it come alive as an interactive lesson -- powered entirely
          by a local AI model, no cloud APIs involved.
        </p>
      </div>
      <CodeSubmissionForm />
    </main>
  );
}
