import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Wand2, PlugZap, Rocket, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Create your assistant",
    desc: "Start from a template or craft a prompt from scratch — names, goals, guardrails, and tone.",
    icon: Wand2,
  },
  {
    title: "Customize voice & behavior",
    desc: "Pick a voice, tune style, and define how your agent handles interruptions and handoffs.",
    icon: Sparkles,
  },
  {
    title: "Connect tools & APIs",
    desc: "Toggle actions like webhooks, CRM updates, or knowledge lookups — without rewriting your UI.",
    icon: PlugZap,
  },
  {
    title: "Deploy anywhere",
    desc: "Embed your agent in sites, apps, and support flows. Ship improvements instantly.",
    icon: Rocket,
  },
] as const;

function useHeroPointerGlow() {
  const reduce = useReducedMotion();
  return useMemo(() => {
    if (reduce) return {} as React.CSSProperties;
    return {
      // Updated via CSS vars in mouse move handler
      background:
        "radial-gradient(420px 240px at var(--px, 50%) var(--py, 30%), hsl(var(--primary) / 0.22), transparent 70%)",
    } as React.CSSProperties;
  }, [reduce]);
}

const Index = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const glowStyle = useHeroPointerGlow();

  return (
    <div ref={ref} className="min-h-screen bg-hero">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-base tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Mic className="h-4 w-4" />
            </span>
            <span>Playful Voice Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild variant="playful" size="sm">
              <Link to="/app">Open Studio</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative overflow-hidden"
          onMouseMove={(e) => {
            const el = e.currentTarget;
            const r = el.getBoundingClientRect();
            const px = `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`;
            const py = `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`;
            el.style.setProperty("--px", px);
            el.style.setProperty("--py", py);
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-80" style={glowStyle} />
          <div className="container grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:py-24">
            <div className="lg:col-span-7">
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl leading-[1.05] tracking-tight md:text-6xl"
              >
                Build custom voice AI agents —
                <span className="block">test them live, ship them anywhere.</span>
              </motion.h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                A playful, premium studio for creating assistants: prompts, voice, tools, and real-time voice testing — in one
                scroll-driven experience.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="playful" size="lg">
                  <Link to="/app">Start building</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#story">See how it works</a>
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-muted-foreground md:max-w-xl md:grid-cols-4">
                <div className="rounded-xl border bg-background/60 p-3 shadow-pop">Builder</div>
                <div className="rounded-xl border bg-background/60 p-3 shadow-pop">Voice playground</div>
                <div className="rounded-xl border bg-background/60 p-3 shadow-pop">Tool toggles</div>
                <div className="rounded-xl border bg-background/60 p-3 shadow-pop">Deploy-ready</div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <motion.div
                style={{ rotate: orbRotate, scale: orbScale }}
                className="relative mx-auto aspect-square w-full max-w-md"
              >
                <div className="absolute inset-0 rounded-[2rem] bg-mesh shadow-glow" />
                <div className="absolute inset-4 rounded-[1.75rem] border bg-background/60 shadow-pop backdrop-blur" />
                <motion.div
                  className="absolute inset-10 rounded-[1.5rem] border bg-card shadow-pop"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid place-items-center gap-2 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                      <Mic className="h-7 w-7" />
                    </div>
                    <p className="font-display text-lg">Live Voice Orb</p>
                    <p className="max-w-[18rem] text-sm text-muted-foreground">
                      Your playground shows connection, speaking state, and latency — in a vibe.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="story" className="container py-14 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-2xl tracking-tight md:text-3xl">A scrollytelling workflow</h2>
              <p className="mt-3 text-muted-foreground">
                Scroll to reveal the build loop. Each step has a sticky visual — like a product demo you can actually use.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild variant="hero">
                  <Link to="/app">Open Studio</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/auth">Create account</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-5">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.title} className="relative overflow-hidden bg-background/70 p-6 shadow-pop">
                      <div className="absolute inset-0 opacity-60 [background-image:var(--gradient-mesh)]" />
                      <div className="relative flex items-start gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground shadow-pop">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-lg tracking-tight">
                            <span className="mr-2 text-muted-foreground">0{idx + 1}.</span>
                            {s.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-background/60">
          <div className="container py-12">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="font-display text-xl tracking-tight">Ready to build your first agent?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Sign in, create an assistant, then hit “Start” in the voice playground.</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="playful">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/app">Open Studio</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
