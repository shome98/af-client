import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { LegalPageContent } from '@/constants/legal.constant';

export function LegalPage({ page }: { page: LegalPageContent }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(32,129,226,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_28%)]" />

      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 max-w-2xl space-y-4">
          <Badge
            variant="outline"
            className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
          >
            {page.eyebrow}
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {page.title}
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              {page.summary}
            </p>
          </div>
        </div>

        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardContent className="space-y-8 p-6 sm:p-8">
            {page.sections.map((section, index) => (
              <div key={section.heading}>
                {index > 0 ? <Separator className="mb-8" /> : null}
                <div className="space-y-4">
                  <h2 className="text-lg font-medium tracking-tight text-foreground">
                    {section.heading}
                  </h2>

                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-muted-foreground sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets ? (
                    <ul className="space-y-3">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-3 text-sm leading-7 text-muted-foreground sm:text-base"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
