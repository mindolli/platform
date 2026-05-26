import { createClient } from "@/lib/supabase/server";
import AssignmentCard from "@/components/AssignmentCard";
import type { AssignmentWithFiles } from "@/types";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch assignments with files
  let query = supabase
    .from("assignments")
    .select("*, assignment_files(*)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: assignments, error } = await query;

  // Get user emails for display
  const assignmentsWithEmail: AssignmentWithFiles[] = (assignments ?? []).map(
    (a) => ({
      ...a,
      user_email: a.user_id === user?.id ? user?.email ?? undefined : undefined,
    })
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          {/* <span className="text-primary">과제를 공유</span>하고
          <br />
          함께 성장하세요 */}
        </h1>
      </section>

      {/* Search + Upload bar */}
      <section className="flex flex-col sm:flex-row gap-4 mb-8">
        <form className="flex-1 relative" action="/" method="GET">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="과제 제목으로 검색..."
            className="input-field pl-12"
            id="search-assignments"
          />
        </form>
      </section>

      {/* Search result info */}
      {q && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted">
          <span>&ldquo;{q}&rdquo; 검색 결과: {assignmentsWithEmail.length}개</span>
          <Link href="/" className="text-primary hover:underline ml-2">
            전체 보기
          </Link>
        </div>
      )}

      {/* Assignment grid */}
      {error ? (
        <div className="text-center py-16">
          <p className="text-danger">데이터를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      ) : assignmentsWithEmail.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignmentsWithEmail.map((assignment) => {
            const imageFile = assignment.assignment_files?.find(f => f.mime_type?.startsWith("image/"));
            const thumbnailUrl = imageFile
              ? supabase.storage.from("assignments").getPublicUrl(imageFile.file_path).data.publicUrl
              : undefined;

            return (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                thumbnailUrl={thumbnailUrl}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-bold mb-2">
            {q ? "검색 결과가 없습니다" : "아직 과제가 없습니다"}
          </h2>
          <p className="text-muted mb-6">
            {q
              ? "다른 키워드로 검색해보세요."
              : "첫 번째 과제를 업로드해보세요!"}
          </p>
          {user && !q && (
            <Link href="/assignments/new" className="btn-primary">
              과제 업로드하기
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
