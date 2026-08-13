import Link from "next/link";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100">Access Denied</h1>
        <p className="text-sm text-zinc-500">
          Your role does not have permission to access the Archivist Console.
          Contact an administrator if you believe this is an error.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
        >
          Return to Site
        </Link>
      </div>
    </div>
  );
}