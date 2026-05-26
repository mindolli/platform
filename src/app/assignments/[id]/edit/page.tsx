import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import AssignmentForm from "@/components/AssignmentForm";

export const metadata = {
  title: "과제 수정 | Greenhouse",
};

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: assignment, error } = await supabase
    .from("assignments")
    .select("*, assignment_files(*)")
    .eq("id", id)
    .single();

  if (error || !assignment) {
    notFound();
  }

  // Only the owner can edit
  if (assignment.user_id !== user.id) {
    redirect(`/assignments/${id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">
          <span className="text-primary">과제 수정</span>
        </h1>
        <p className="text-muted">과제 내용을 수정하세요.</p>
      </div>

      <div className="card p-6 sm:p-8">
        <AssignmentForm
          mode="edit"
          initialData={{
            id: assignment.id,
            title: assignment.title,
            description: assignment.description ?? "",
            author_name: assignment.author_name ?? "",
            links: assignment.links ?? [],
            existingFiles: assignment.assignment_files?.map(
              (f: { file_name: string; file_path: string }) => ({
                file_name: f.file_name,
                file_path: f.file_path,
              })
            ),
          }}
        />
      </div>
    </div>
  );
}
