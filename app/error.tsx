"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="font-display mt-3 text-4xl">Please try again.</h1>
        <button type="button" className="btn btn-solid mt-8" onClick={reset}>Reload</button>
      </div>
    </main>
  );
}
