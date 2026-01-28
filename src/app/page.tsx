export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-10 text-center shadow-sm dark:border-white/15 dark:bg-black">
        <h1 className="font-sans text-5xl font-semibold tracking-tight text-foreground">
          Hello, world.
        </h1>
        <p className="mt-4 text-base leading-7 text-black/70 dark:text-white/70">
          Your Next.js app is running.
        </p>
      </div>
    </main>
  );
}
