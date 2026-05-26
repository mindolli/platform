export type Assignment = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  links: string[];
  created_at: string;
  updated_at: string;
  author_name?: string | null;
  user_email?: string;
};

export type AssignmentFile = {
  id: string;
  assignment_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export type AssignmentWithFiles = Assignment & {
  assignment_files: AssignmentFile[];
};
