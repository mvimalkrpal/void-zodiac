import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] font-sans text-white selection:bg-purple-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 flex w-full max-w-xl flex-col items-center gap-12 px-6 py-24 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-purple-400 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
            Shopify Auth Test
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Void Zodiac
          </h1>

          <p className="max-w-md mx-auto text-lg text-zinc-400 leading-relaxed">
            Testing Shopify Customer Account API integration. Secure, modern, and seamless authentication.
          </p>
        </div>

        <div className="flex flex-col w-full gap-4">
          <a
            href="/api/auth/login"
            className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-white text-black font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-10"></div>
            <Image
              src="https://cdn.shopify.com/assets/images/logos/shopify-bag.svg"
              alt="Shopify"
              width={20}
              height={20}
              className="mr-3 filter grayscale brightness-0"
            />
            Sign in with Shopify
          </a>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Environment Status</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left backdrop-blur-sm">
              <p className="text-xs text-zinc-500 mb-1">Endpoints</p>
              <p className="text-sm font-mono text-zinc-300">/api/auth/*</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left backdrop-blur-sm">
              <p className="text-xs text-zinc-500 mb-1">Protocol</p>
              <p className="text-sm font-mono text-zinc-300">OAuth 2.0</p>
            </div>
          </div>
        </div>

        <footer className="pt-8 text-sm text-zinc-500">
          Make sure to configure your <code>.env.local</code> file first.
        </footer>
      </main>
    </div>
  );
}

