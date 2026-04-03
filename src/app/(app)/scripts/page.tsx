import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { scriptCategoryLabel, scriptTypeLabel, tagsToString, type ScriptRecord } from "@/lib/cms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ScriptsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scripts")
    .select("*")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  const scripts = (data as ScriptRecord[]) ?? [];

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Scripts"
        title="Sales scripts"
        description="Published prospecting templates, talk tracks, and objection handling scripts managed through the CMS."
      />
      {error ? (
        <Card title="Unable to load scripts">
          <p>{error.message}</p>
        </Card>
      ) : scripts.length ? (
        <section className="content-grid">
          {scripts.map((script) => (
            <Card
              key={script.id}
              title={script.title}
              eyebrow={`${scriptCategoryLabel(script.category)} · ${scriptTypeLabel(script.script_type)}`}
            >
              <p>{script.body}</p>
              {script.tags.length ? <p className="helper-text">Tags: {tagsToString(script.tags)}</p> : null}
              {script.is_featured ? <p className="helper-text">Featured in toolkit</p> : null}
            </Card>
          ))}
        </section>
      ) : (
        <Card title="No published scripts yet">
          <p>Publish scripts from the admin CMS to make them available to reps.</p>
        </Card>
      )}
    </div>
  );
}
