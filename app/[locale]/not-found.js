import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Try searching for a provider or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Go Home
          </Link>
          <Link
            href="/united-states"
            className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            Browse States
          </Link>
        </div>
      </div>
    </div>
  );
}
