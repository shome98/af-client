import { LANDING } from '@/constants/landing.constant';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const Features = () => {
  return (
    <>
      <section id="features" className="px-6 py-2">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {LANDING.features.title}
            </h2>
            <p className=" mt-2 max-w-xl mx-auto">
              {LANDING.features.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {LANDING.features.items.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/70 bg-card/90shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div
                    className="text-2xl mb-2"
                    role="img"
                    aria-label={feature.title}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-md leading-relaxed text-slate-500">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
