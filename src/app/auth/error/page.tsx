import Link from "next/link";

type Props = { searchParams: Promise<{ message?: string }> };

export default async function AuthErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const message = params.message ?? "An error occurred during sign-in.";

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
        <p className="font-medium">Sign-in error</p>
        <p className="mt-1 text-sm opacity-90">{decodeURIComponent(message)}</p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm font-medium underline"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
