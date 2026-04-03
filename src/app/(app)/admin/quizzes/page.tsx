import { QuizzesCMS } from "@/components/admin/quizzes-cms";
import { PageIntro } from "@/components/ui/page-intro";

export default function AdminQuizzesPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage quizzes"
        description="Create lesson quizzes, manage question order, and maintain answer keys for the training program."
      />
      <QuizzesCMS />
    </div>
  );
}
