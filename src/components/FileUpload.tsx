"use client";

import { useCallback, useState, useRef } from "react";

type UploadedFile = {
  file: File;
  preview?: string;
};

export default function FileUpload({
  onFilesChange,
  existingFiles,
}: {
  onFilesChange: (files: File[]) => void;
  existingFiles?: { file_name: string; file_path: string }[];
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB

      const validFiles = fileArray.filter((file) => {
        if (file.size > MAX_SIZE) {
          alert(`"${file.name}"의 크기가 10MB를 초과합니다.`);
          return false;
        }
        return true;
      });

      const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      }));

      const updated = [...files, ...uploadedFiles];
      setFiles(updated);
      onFilesChange(updated.map((f) => f.file));
    },
    [files, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index);
      // Revoke old preview URL
      if (files[index].preview) {
        URL.revokeObjectURL(files[index].preview!);
      }
      setFiles(updated);
      onFilesChange(updated.map((f) => f.file));
    },
    [files, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "📊";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Existing files */}
      {existingFiles && existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted">기존 첨부 파일</p>
          {existingFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface"
            >
              <span>📎</span>
              <span className="text-sm truncate flex-1">{file.file_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-card-border hover:border-primary/50 hover:bg-surface"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`text-4xl transition-transform duration-300 ${isDragging ? "scale-125" : ""}`}>
            📁
          </div>
          <div>
            <p className="text-sm font-medium">
              파일을 드래그하여 놓거나{" "}
              <span className="text-primary font-semibold">클릭하여 선택</span>
            </p>
            <p className="text-xs text-muted mt-1">
              최대 10MB, 여러 파일 첨부 가능
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface"
            >
              {/* Preview or icon */}
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt={uploadedFile.file.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <span className="text-2xl">
                  {getFileIcon(uploadedFile.file.type)}
                </span>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-muted">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
