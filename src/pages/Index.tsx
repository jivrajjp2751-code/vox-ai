import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Wand2,
  PlugZap,
  Rocket,
  Sparkles,
  Bot,
  AudioWaveform,
  Globe,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Custom AI Agents",
    desc: "Build voice assistants with custom personalities, prompts, and behaviors tailored to your use case.",
  },
  {
    icon: AudioWaveform,
    title: "Natural Voices",
    desc: "Choose from premium voice models with adjustable tone, speed, and emotion for lifelike conversations.",
  },
  {
    icon: PlugZap,
    title: "Tool Calling",
    desc: "Connect webhooks, APIs, and CRMs. Let your assistant take actions during live conversations.",
  },
  {
    icon: Zap,
    title: "Ultra-Low Latency",
    desc: "Sub-second response times with streaming audio and real-time WebSocket connections.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    desc: "Deploy assistants in 30+ languages with automatic detection and seamless switching.",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    desc: "SOC2 compliant, end-to-end encryption, and role-based access for production deployments.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create Your Assistant",
    desc: "Define your agent's persona, system prompt, and conversation style in our intuitive builder.",
    icon: Wand2,
  },
  {
    num: "02",
    title: "Configure Voice & Behavior",
    desc: "Select a voice, set the tone, adjust temperature, and fine-tune how your assistant responds.",
    icon: Sparkles,
  },
  {
    num: "03",
    title: "Connect Tools & APIs",
    desc: "Wire up webhooks, databases, and external services so your assistant can take real actions.",
    icon: PlugZap,
  },
  {
    num: "04",
    title: "Deploy Anywhere",
    desc: "Push to production with a single click. Embed via SDK, phone number, or web widget.",
    icon: Rocket,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Mic className="h-4 w-4" />
            </span>
            VOXAI
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition hover:text-foreground">How It Works</a>
            <a href="#cta" className="transition hover:text-foreground">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log In</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section
          ref={heroRef}
          className="relative overflow-hidden"
          onMouseMove={(e) => {
            const el = heroRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
            el.style.setProperty("--my", `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
          }}
        >
          {/* Pointer-reactive glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: "radial-gradient(600px 350px at var(--mx, 50%) var(--my, 30%), hsl(180 100% 50% / 0.07), transparent 70%)",
            }}
          />
          {/* Static hero glow */}
          <div className="pointer-events-none absolute inset-0 bg-hero" />

          <div className="container relative flex flex-col items-center py-24 text-center lg:py-36">
            {/* Beta badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Now in Public Beta
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
            >
              Build Custom{" "}
              <br />
              <span className="text-gradient">Voice AI Agents</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
            >
              Create, customize, and deploy production-ready voice assistants in minutes. Plug in any LLM, voice, or tool — and go live.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Button asChild variant="hero" size="lg">
                <Link to="/auth?tab=signup">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/app">
                  <Mic className="h-4 w-4" />
                  Try Live Demo
                </Link>
              </Button>
            </motion.div>

            {/* Animated Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative mt-16 flex items-center justify-center"
            >
              <div className="absolute h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-orb-breathe" />
              <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-primary/60 to-primary shadow-glow animate-pulse-glow" />
              <div className="absolute h-28 w-28 rounded-full bg-primary/30 blur-xl animate-orb-breathe" style={{ animationDelay: "1s" }} />
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-border/50 py-20 lg:py-28">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={0}
              className="mb-14 text-center"
            >
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Everything You Need</h2>
              <p className="mt-4 text-muted-foreground">
                A complete platform for building, testing, and deploying voice AI at scale.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeUp}
                    custom={i}
                    className="group rounded-2xl border border-border/50 bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-glow"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-t border-border/50 py-20 lg:py-28">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={0}
              className="mb-14 text-center"
            >
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
              <p className="mt-4 text-muted-foreground">Four steps to your first voice agent.</p>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.num}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeUp}
                    custom={i}
                    className="relative rounded-2xl border border-border/50 bg-card p-6 shadow-card"
                  >
                    <span className="font-display text-4xl font-bold text-primary/20">{s.num}</span>
                    <div className="mt-4 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="border-t border-border/50 py-20 lg:py-28">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={0}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Ready to Build?</h2>
              <p className="mt-4 text-muted-foreground">
                Start creating your first voice agent in under 5 minutes. No credit card required.
              </p>
              <div className="mt-8">
                <Button asChild variant="hero" size="lg">
                  <Link to="/auth?tab=signup">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs">
              <Mic className="h-3.5 w-3.5" />
            </span>
            VOXAI
          </div>
          <p>© {new Date().getFullYear()} VOXAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
