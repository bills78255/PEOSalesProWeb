import { PipelineManager } from "@/components/pipeline/pipeline-manager";
import { PageIntro } from "@/components/ui/page-intro";

export default function PipelinePage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Pipeline"
        title="Sales pipeline"
        description="Track deals, contacts, stages, estimated value, and close dates in your Supabase-backed rep pipeline."
      />
      <PipelineManager />
    </div>
  );
}
