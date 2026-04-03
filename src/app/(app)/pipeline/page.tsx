import { PipelineManager } from "@/components/pipeline/pipeline-manager";
import { PageIntro } from "@/components/ui/page-intro";

export default function PipelinePage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Pipeline"
        title="Lightweight deal tracker"
        description="Track active deals with just the essentials, then capture structured win data whenever a deal closes won."
      />
      <PipelineManager />
    </div>
  );
}
