import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-card-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <span className="text-xl font-bold text-black dark:text-white group-hover:opacity-80 transition-opacity">
            과제 공유 플랫폼
          </span>
        </Link>

        {/* Auth area */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted hidden sm:block">
                {user.email}
              </span>
              <Link href="/assignments/new" className="btn-primary text-sm py-2 px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="hidden sm:inline">과제 업로드</span>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-primary text-sm py-2 px-4"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
