import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { StatCard } from "@/components/ui/stat-card";
import { dashboardStats, opportunitiesPreview, scriptsPreview, trainingModules } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Dashboard"
        title="Your sales command center"
        description="Track activity, jump into training, work the pipeline, and keep commission tools close at hand."
      />

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <Card eyebrow="Training" title="In progress modules">
          <ul className="stack-list">
            {trainingModules.map((module) => (
              <li key={module.title}>
                <strong>{module.title}</strong>
                <span>{module.progress}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card eyebrow="Scripts" title="Most-used talk tracks">
          <ul className="stack-list">
            {scriptsPreview.map((script) => (
              <li key={script}>{script}</li>
            ))}
          </ul>
        </Card>
        <Card eyebrow="Pipeline" title="Pipeline snapshot">
          <ul className="stack-list">
            {opportunitiesPreview.map((item) => (
              <li key={item.account}>
                <strong>{item.account}</strong>
                <span>
                  {item.stage} · {item.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
