import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}>;

export function Card({ className, title, eyebrow, action, children }: CardProps) {
  return (
    <section className={cn("card", className)}>
      {(title || eyebrow || action) && (
        <div className="card-head">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h3>{title}</h3> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
