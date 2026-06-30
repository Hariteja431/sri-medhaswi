import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { FileText, PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Generator",
  description: "Minimalist, powerful paper generation",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("medhaswi_admin_session")?.value === "true";

  return (
    <html
      lang="en"
      className={`font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 selection:bg-black/10">
        {isAuthenticated && (
          <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-zinc-200 shadow-sm print:hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
                  <Link 
                    href="/" 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-lg text-sm sm:text-base font-semibold bg-black text-white hover:bg-zinc-800 transition-all shadow-sm"
                  >
                    <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                    Generator
                  </Link>
                  <Link 
                    href="/logs" 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-lg text-sm sm:text-base font-semibold bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-sm"
                  >
                    <FileText className="w-5 h-5 sm:w-4 sm:h-4" />
                    Paper Logs
                  </Link>
                </div>
                
                <div className="hidden md:block">
                  <form action={async () => {
                    "use server";
                    const { logoutUser } = await import("./actions");
                    await logoutUser();
                  }}>
                    <button 
                      type="submit" 
                      className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Log out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </nav>
        )}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </body>
    </html>
  );
}
