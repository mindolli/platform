"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ALLOWED_DOMAINS = ["o.cnu.ac.kr", "cnu.ac.kr"];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Domain validation
    const emailDomain = email.split("@")[1];
    if (!ALLOWED_DOMAINS.includes(emailDomain)) {
      setMessage({
        type: "error",
        text: `@${ALLOWED_DOMAINS.join(", @")} 도메인의 이메일만 사용할 수 있습니다.`,
      });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message,
        });
      } else {
        setMessage({
          type: "success",
          text: "로그인 링크가 이메일로 전송되었습니다! 메일함을 확인해주세요.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-3xl font-extrabold mb-2">
            Greenhouse
          </h1>
          <p className="text-muted">충남대학교 과제 공유 플랫폼</p>
        </div>

        {/* Login card */}
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-1">로그인</h2>
          <p className="text-sm text-muted mb-6">
            학교 이메일로 매직 링크를 받아 로그인하세요.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold">
                학교 이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@o.cnu.ac.kr"
                className="input-field"
                autoComplete="email"
                autoFocus
              />
              <p className="text-xs text-muted">
                학교 이메일 (@o.cnu.ac.kr, @cnu.ac.kr)만 사용할 수 있습니다.
              </p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl text-sm ${
                  message.type === "success"
                    ? "bg-primary/10 border border-primary/20 text-primary-dark"
                    : "bg-danger/10 border border-danger/20 text-danger"
                }`}
              >
                {message.type === "success" && (
                  <span className="mr-2">✉️</span>
                )}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="btn-primary w-full justify-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  전송 중...
                </span>
              ) : (
                "로그인 링크 받기"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          로그인 시 서비스 이용약관에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
