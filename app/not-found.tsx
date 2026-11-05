import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="font-display mt-3 text-5xl">Nothing here.</h1>
        <Link href="/" className="btn btn-solid mt-8">Back to the portfolio</Link>
      </div>
    </main>
  );
}
