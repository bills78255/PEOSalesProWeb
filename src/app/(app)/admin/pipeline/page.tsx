import { PipelineManager } from "@/components/pipeline/pipeline-manager";
import { PageIntro } from "@/components/ui/page-intro";

export default function AdminPipelinePage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage pipeline"
        description="Admin-level oversight of the shared sales pipeline, ownership, stage hygiene, and cleanup workflows."
      />
      <PipelineManager mode="admin" />
    </div>
  );
}
