import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssignmentForm from "@/components/AssignmentForm";

export const metadata = {
  title: "과제 업로드 | Greenhouse",
  description: "새로운 과제를 업로드하세요.",
};

export default async function NewAssignmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">
          <span className="text-primary">과제 업로드</span>
        </h1>
        <p className="text-muted">
          과제 정보를 입력하고 관련 파일을 첨부하세요.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <AssignmentForm mode="create" />
      </div>
    </div>
  );
}
