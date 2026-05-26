"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "./FileUpload";
import { createClient } from "@/lib/supabase/client";

type AssignmentFormProps = {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    title: string;
    description: string;
    author_name?: string | null;
    links: string[];
    existingFiles?: { file_name: string; file_path: string }[];
  };
};

export default function AssignmentForm({
  mode,
  initialData,
}: AssignmentFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [authorName, setAuthorName] = useState(
    initialData?.author_name ?? ""
  );
  const [links, setLinks] = useState<string[]>(
    initialData?.links?.length ? initialData.links : [""]
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const addLink = () => {
    setLinks((prev) => [...prev, ""]);
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, value: string) => {
    setLinks((prev) => prev.map((link, i) => (i === index ? value : link)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("로그인이 필요합니다.");
        return;
      }

      // Filter out empty links
      const validLinks = links.filter((link) => link.trim() !== "");

      if (mode === "create") {
        // 1. Create assignment
        const { data: assignment, error: assignmentError } = await supabase
          .from("assignments")
          .insert({
            user_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
            author_name: authorName.trim() || null,
            links: validLinks,
          })
          .select()
          .single();

        if (assignmentError) throw assignmentError;

        // 2. Upload files
        if (files.length > 0) {
          for (const file of files) {
            const filePath = `${user.id}/${assignment.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("assignments")
              .upload(filePath, file);

            if (uploadError) {
              console.error("File upload error:", uploadError);
              continue;
            }

            // 3. Save file metadata
            await supabase.from("assignment_files").insert({
              assignment_id: assignment.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
            });
          }
        }

        router.push(`/assignments/${assignment.id}`);
        router.refresh();
      } else if (mode === "edit" && initialData?.id) {
        // Update assignment
        const { error: updateError } = await supabase
          .from("assignments")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            author_name: authorName.trim() || null,
            links: validLinks,
          })
          .eq("id", initialData.id);

        if (updateError) throw updateError;

        // Upload new files
        if (files.length > 0) {
          for (const file of files) {
            const filePath = `${user.id}/${initialData.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("assignments")
              .upload(filePath, file);

            if (uploadError) {
              console.error("File upload error:", uploadError);
              continue;
            }

            await supabase.from("assignment_files").insert({
              assignment_id: initialData.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
            });
          }
        }

        router.push(`/assignments/${initialData.id}`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-semibold">
          제목 <span className="text-danger">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="과제 제목을 입력하세요"
          className="input-field"
          maxLength={200}
        />
      </div>

      {/* Author Name */}
      <div className="space-y-2">
        <label htmlFor="authorName" className="block text-sm font-semibold">
          작성자 이름 (선택사항)
        </label>
        <input
          id="authorName"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="홍길동"
          className="input-field"
          maxLength={50}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-semibold">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="과제에 대한 설명을 작성하세요"
          className="textarea-field"
          rows={5}
        />
      </div>

      {/* Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold">관련 링크</label>
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1 cursor-pointer"
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
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            링크 추가
          </button>
        </div>
        {links.map((link, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
              placeholder="https://example.com"
              className="input-field"
            />
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
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
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold">파일 첨부</label>
        <FileUpload
          onFilesChange={handleFilesChange}
          existingFiles={initialData?.existingFiles}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="btn-primary flex-1"
        >
          {isSubmitting ? (
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
              {mode === "create" ? "업로드 중..." : "저장 중..."}
            </span>
          ) : mode === "create" ? (
            "과제 업로드"
          ) : (
            "변경사항 저장"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          취소
        </button>
      </div>
    </form>
  );
}
