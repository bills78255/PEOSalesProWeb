import { TrainingsCMS } from "@/components/admin/trainings-cms";
import { PageIntro } from "@/components/ui/page-intro";

export default function AdminTrainingsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage trainings"
        description="Create training modules, manage lessons, reorder content, and publish updates without touching code."
      />
      <TrainingsCMS />
    </div>
  );
}
