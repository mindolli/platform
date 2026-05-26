import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { AssignmentWithFiles } from "@/types";
import DeleteButton from "./DeleteButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("assignments")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: data ? `${data.title} | Greenhouse` : "과제 상세 | Greenhouse",
  };
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignment, error } = await supabase
    .from("assignments")
    .select("*, assignment_files(*)")
    .eq("id", id)
    .single();

  if (error || !assignment) {
    notFound();
  }

  const typedAssignment = assignment as AssignmentWithFiles;
  const isOwner = user?.id === typedAssignment.user_id;
  const formattedDate = new Date(typedAssignment.created_at).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }
  );

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("assignments")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
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
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        목록으로 돌아가기
      </Link>

      <article className="card p-6 sm:p-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight">
            {typedAssignment.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="font-medium text-foreground">
              {typedAssignment.author_name || "익명"}
            </span>
            <span>•</span>
            <time>{formattedDate}</time>
            {isOwner && (
              <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                내 과제
              </span>
            )}
          </div>
        </header>

        {/* Description */}
        {typedAssignment.description && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              설명
            </h2>
            <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {typedAssignment.description}
            </div>
          </section>
        )}

        {/* Links */}
        {typedAssignment.links && typedAssignment.links.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              관련 링크
            </h2>
            <ul className="space-y-2">
              {typedAssignment.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent hover:text-primary transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    <span className="group-hover:underline truncate max-w-md">
                      {link}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Files */}
        {typedAssignment.assignment_files &&
          typedAssignment.assignment_files.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                첨부 파일
              </h2>
              <div className="space-y-2">
                {typedAssignment.assignment_files.map((file) => {
                  const url = getPublicUrl(file.file_path);
                  const isImage = file.mime_type?.startsWith("image/");
                  const fileSize = file.file_size
                    ? file.file_size < 1024 * 1024
                      ? `${(file.file_size / 1024).toFixed(1)} KB`
                      : `${(file.file_size / (1024 * 1024)).toFixed(1)} MB`
                    : "";

                  return (
                    <div key={file.id}>
                      {isImage && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-card-border">
                          <img
                            src={url}
                            alt={file.file_name}
                            className="w-full max-h-96 object-contain bg-surface"
                          />
                        </div>
                      )}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-primary/5 transition-colors group"
                      >
                        <span className="text-xl">
                          {isImage
                            ? "🖼️"
                            : file.mime_type?.includes("pdf")
                              ? "📄"
                              : "📎"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {file.file_name}
                          </p>
                          {fileSize && (
                            <p className="text-xs text-muted">{fileSize}</p>
                          )}
                        </div>
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
                          className="text-muted group-hover:text-primary transition-colors shrink-0"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        {/* Owner actions */}
        {isOwner && (
          <div className="flex gap-3 pt-6 border-t border-card-border">
            <Link
              href={`/assignments/${typedAssignment.id}/edit`}
              className="btn-secondary flex items-center gap-2"
            >
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
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              수정
            </Link>
            <DeleteButton assignmentId={typedAssignment.id} />
          </div>
        )}
      </article>
    </div>
  );
}
