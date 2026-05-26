import Link from "next/link";
import type { AssignmentWithFiles } from "@/types";

export default function AssignmentCard({
  assignment,
  thumbnailUrl,
}: {
  assignment: AssignmentWithFiles;
  thumbnailUrl?: string;
}) {
  const fileCount = assignment.assignment_files?.length ?? 0;
  const linkCount = assignment.links?.length ?? 0;
  const formattedDate = new Date(assignment.created_at).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <Link href={`/assignments/${assignment.id}`} className="block h-full">
      <article className="card h-full flex flex-col overflow-hidden cursor-pointer group" id={`assignment-card-${assignment.id}`}>
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <div className="aspect-video w-full overflow-hidden bg-surface border-b border-card-border relative">
            <img 
              src={thumbnailUrl} 
              alt={assignment.title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-surface border-b border-card-border flex items-center justify-center">
            <span className="text-4xl">🌱</span>
          </div>
        )}

        <div className="p-6 flex flex-col gap-4 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-snug line-clamp-2 flex-1">
            {assignment.title}
          </h3>
          {fileCount > 0 && (
            <span className="shrink-0 inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              {fileCount}
            </span>
          )}
        </div>

        {/* Description */}
        {assignment.description && (
          <p className="text-sm text-muted leading-relaxed line-clamp-3 flex-1">
            {assignment.description}
          </p>
        )}

        {/* Links preview */}
        {linkCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <span>링크 {linkCount}개</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-card-border">
          <span className="text-xs font-medium text-foreground">
            {assignment.author_name 
              ? assignment.author_name 
              : assignment.user_email
                ? assignment.user_email.split("@")[0]
                : "익명"}
          </span>
          <time className="text-xs text-muted">{formattedDate}</time>
        </div>
        </div>
      </article>
    </Link>
  );
}
