import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";

export default function CalculatorsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Calculators"
        title="Commission calculators"
        description="Two starter calculator shells are included so the business logic can be connected to live calculator settings next."
      />
      <section className="content-grid">
        <Card eyebrow="Residual" title="Residual commission calculator">
          <div className="mini-form-grid">
            <label>
              Monthly PEPM
              <input type="number" placeholder="45" />
            </label>
            <label>
              Employees
              <input type="number" placeholder="85" />
            </label>
            <label>
              Rep split %
              <input type="number" placeholder="50" />
            </label>
          </div>
          <p className="helper-text">Wire this to `calculator_settings` so admin can manage assumptions centrally.</p>
        </Card>
        <Card eyebrow="Non-residual" title="Non-residual commission calculator">
          <div className="mini-form-grid">
            <label>
              One-time revenue
              <input type="number" placeholder="12000" />
            </label>
            <label>
              Commission %
              <input type="number" placeholder="12" />
            </label>
            <label>
              Bonus $
              <input type="number" placeholder="500" />
            </label>
          </div>
          <p className="helper-text">This starter screen is ready for formulas and stored defaults from Supabase.</p>
        </Card>
      </section>
    </div>
  );
}
