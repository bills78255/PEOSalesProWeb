import { ScriptsCMS } from "@/components/admin/scripts-cms";
import { PageIntro } from "@/components/ui/page-intro";

export default function AdminScriptsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage scripts"
        description="Edit call scripts, email templates, objection handling, tags, and feature state from one admin workspace."
      />
      <ScriptsCMS />
    </div>
  );
}
