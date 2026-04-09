import { LANDING } from '@/constants/landing.constant';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Pricing = () => {
  return (
    <section id="pricing" className="px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pricing
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {LANDING.pricing.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            {LANDING.pricing.subtitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {LANDING.pricing.freeTierNote}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {LANDING.pricing.tiers.map((tier) => {
            const buttonVariant = tier.isHighlighted ? 'default' : 'outline';

            return (
              <Card
                key={tier.name}
                className={[
                  'h-full border bg-card/95 shadow-sm transition-transform duration-200',
                  tier.isHighlighted
                    ? 'relative overflow-hidden border-foreground/60 ring-1 ring-foreground/30'
                    : 'border-border/80 hover:-translate-y-1',
                ].join(' ')}
              >
                <CardHeader className="min-h-56 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-2xl font-semibold">
                      {tier.name}
                    </CardTitle>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        tier.isHighlighted
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {tier.badge}
                    </span>
                  </div>
                  <CardDescription className="text-sm leading-6">
                    {tier.description}
                  </CardDescription>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {tier.price}
                    </span>
                    <span className="pb-1 text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-start">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span
                          className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground"
                          aria-hidden="true"
                        >
                          +
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-6 border-t border-border/60 bg-transparent">
                  <Button asChild className="w-full" variant={buttonVariant}>
                    <Link href="/register">{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
