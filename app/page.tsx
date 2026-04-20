import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PaintBrush01Icon,
  Settings02Icon,
  TestTube01Icon,
} from "@hugeicons/core-free-icons";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background min-h-screen relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Badge */}
        <Badge variant="outline" className="mb-6">
          HR Workflow Designer v1.0
        </Badge>

        {/* Hero heading */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Design HR Workflows{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Visually
          </span>
        </h1>

        <p className="mt-4 text-base text-muted-foreground max-w-md leading-relaxed">
          Build, test, and iterate on onboarding, leave approval, and document
          verification workflows with a powerful drag-and-drop canvas.
        </p>

        {/* CTA */}
        <div className="flex gap-3 mt-8">
          <Button asChild size="lg" className="px-6">
            <Link href="/designer">Open Designer</Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full">
          {[
            {
              icon: PaintBrush01Icon,
              title: "Visual Canvas",
              description:
                "Drag-and-drop nodes to build workflows visually with React Flow",
            },
            {
              icon: Settings02Icon,
              title: "Configurable Nodes",
              description:
                "6 node types with dynamic forms, key-value editors, and role selectors",
            },
            {
              icon: TestTube01Icon,
              title: "Test Sandbox",
              description:
                "Validate structure, simulate execution, and view step-by-step logs",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center p-5 rounded-xl border bg-card/50 backdrop-blur-sm text-center"
            >
              <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 mb-3">
                <HugeiconsIcon icon={feature.icon} strokeWidth={2} className="size-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
