import { unstable_noStore as noStore } from "next/cache";

import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type OpportunityRow = {
  id: string;
  account_name: string;
  stage: string;
  estimated_value: number | null;
};

type WinRow = {
  id: string;
  created_at: string;
};

type QuizResultRow = {
  lesson_id: string;
};

type ScriptRow = {
  id: string;
  title: string;
  is_featured: boolean;
};

type TrainingRow = {
  id: string;
  title: string;
};

type LessonRow = {
  id: string;
};

const openPipelineStages = ["new", "discovery", "quoted", "proposal"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function DashboardPage() {
  noStore();

  const { user, profile } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const userID = user.id;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    opportunitiesResult,
    winsResult,
    quizResultsResult,
    scriptsResult,
    trainingsResult,
    lessonsResult
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id,account_name,stage,estimated_value")
      .eq("owner_id", userID)
      .order("updated_at", { ascending: false }),
    supabase
      .from("wins")
      .select("id,created_at")
      .eq("user_id", userID)
      .gte("created_at", startOfMonth.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("quiz_results")
      .select("lesson_id")
      .eq("user_id", userID),
    supabase
      .from("scripts")
      .select("id,title,is_featured")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("trainings")
      .select("id,title")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(3),
    supabase
      .from("training_lessons")
      .select("id")
      .eq("status", "published")
  ]);

  const opportunities = (opportunitiesResult.data as OpportunityRow[]) ?? [];
  const wins = (winsResult.data as WinRow[]) ?? [];
  const quizResults = (quizResultsResult.data as QuizResultRow[]) ?? [];
  const scripts = (scriptsResult.data as ScriptRow[]) ?? [];
  const trainings = (trainingsResult.data as TrainingRow[]) ?? [];
  const publishedLessons = (lessonsResult.data as LessonRow[]) ?? [];

  const openDeals = opportunities.filter((row) => openPipelineStages.includes(row.stage));
  const estimatedPipelineValue = openDeals.reduce((sum, row) => sum + (row.estimated_value ?? 0), 0);
  const completedLessonIDs = new Set(quizResults.map((row) => row.lesson_id));
  const trainingCompletion = publishedLessons.length
    ? Math.round((completedLessonIDs.size / publishedLessons.length) * 100)
    : 0;

  const stats = [
    {
      label: "Open Pipeline Deals",
      value: String(openDeals.length),
      detail: openDeals.length
        ? `${openDeals.length} deal${openDeals.length === 1 ? "" : "s"} currently assigned to you`
        : "You have no open pipeline deals yet. Add your first deal to start tracking momentum."
    },
    {
      label: "Training Completion",
      value: `${trainingCompletion}%`,
      detail: trainingCompletion
        ? "Your progress across published quiz-backed lessons"
        : "No training progress yet. Start a module and complete a lesson quiz to begin tracking progress."
    },
    {
      label: "Wins This Month",
      value: String(wins.length),
      detail: wins.length
        ? `${wins.length} recorded win${wins.length === 1 ? "" : "s"} this month`
        : "No wins recorded this month yet. Share one once you close, renew, or save an account."
    },
    {
      label: "Est. Pipeline Value",
      value: formatCurrency(estimatedPipelineValue),
      detail: estimatedPipelineValue
        ? "Estimated value across your currently open pipeline"
        : "Your estimated pipeline value is currently $0 because you do not have any open deals."
    }
  ];

  const errors = [
    opportunitiesResult.error?.message,
    winsResult.error?.message,
    quizResultsResult.error?.message,
    scriptsResult.error?.message,
    trainingsResult.error?.message,
    lessonsResult.error?.message
  ].filter(Boolean) as string[];

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Dashboard"
        title="Your sales command center"
        description="Track your own activity, training progress, and live pipeline with user-specific data from Supabase."
      />

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <Card title="Temporary Debug" eyebrow="User Scope">
        <ul className="stack-list">
          <li>
            <strong>User ID</strong>
            <span>{userID}</span>
          </li>
          <li>
            <strong>Role</strong>
            <span>{profile?.role ?? "unknown"}</span>
          </li>
          <li>
            <strong>Opportunity Rows Returned</strong>
            <span>{String(opportunities.length)}</span>
          </li>
          <li>
            <strong>Open Deal Rows Returned</strong>
            <span>{String(openDeals.length)}</span>
          </li>
          <li>
            <strong>Wins Rows Returned</strong>
            <span>{String(wins.length)}</span>
          </li>
          <li>
            <strong>Quiz Result Rows Returned</strong>
            <span>{String(quizResults.length)}</span>
          </li>
          <li>
            <strong>Published Lessons Count</strong>
            <span>{String(publishedLessons.length)}</span>
          </li>
        </ul>
      </Card>

      {errors.length ? (
        <Card title="Some dashboard data could not be loaded">
          <p>{errors[0]}</p>
        </Card>
      ) : null}

      <section className="content-grid">
        <Card eyebrow="Training" title="Continue learning">
          {trainings.length ? (
            <ul className="stack-list">
              {trainings.map((training) => (
                <li key={training.id}>
                  <strong>{training.title}</strong>
                  <span>Published and ready to start</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">No published trainings are available yet. Your admin can publish modules from the CMS.</p>
          )}
        </Card>
        <Card eyebrow="Scripts" title="Recommended talk tracks">
          {scripts.length ? (
            <ul className="stack-list">
              {scripts.map((script) => (
                <li key={script.id}>
                  <strong>{script.title}</strong>
                  <span>{script.is_featured ? "Featured script" : "Published script"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">No published scripts are available yet. Your script library will appear here once content is published.</p>
          )}
        </Card>
        <Card eyebrow="Pipeline" title="Pipeline snapshot">
          {openDeals.length ? (
            <ul className="stack-list">
              {openDeals.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <strong>{item.account_name}</strong>
                  <span>
                    {item.stage} · {formatCurrency(item.estimated_value ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">You do not have any open pipeline deals yet. Add your first deal to start building this view.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
