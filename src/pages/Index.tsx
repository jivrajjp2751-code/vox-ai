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
  { icon: Bot, title: "Custom AI Agents", desc: "Build voice assistants with custom personalities, prompts, and behaviors tailored to your use case." },
  { icon: AudioWaveform, title: "Natural Voices", desc: "Choose from premium voice models with adjustable tone, speed, and emotion for lifelike conversations." },
  { icon: PlugZap, title: "Tool Calling", desc: "Connect webhooks, APIs, and CRMs. Let your assistant take actions during live conversations." },
  { icon: Zap, title: "Ultra-Low Latency", desc: "Sub-second response times with streaming audio and real-time WebSocket connections." },
  { icon: Globe, title: "Multi-Language", desc: "Deploy assistants in 30+ languages with automatic detection and seamless switching." },
  { icon: Shield, title: "Enterprise Ready", desc: "SOC2 compliant, end-to-end encryption, and role-based access for production deployments." },
];

const steps = [
  { num: "01", title: "Create Your Assistant", desc: "Define your agent's persona, system prompt, and conversation style in our intuitive builder.", icon: Wand2 },
  { num: "02", title: "Configure Voice & Behavior", desc: "Select a voice, set the tone, adjust temperature, and fine-tune how your assistant responds.", icon: Sparkles },
  { num: "03", title: "Connect Tools & APIs", desc: "Wire up webhooks, databases, and external services so your assistant can take real actions.", icon: PlugZap },
  { num: "04", title: "Deploy Anywhere", desc: "Push to production with a single click. Embed via SDK, phone number, or web widget.", icon: Rocket },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/40 glass">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Mic className="h-3.5 w-3.5" />
            </span>
            VOXAI
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition hover:text-foreground">How It Works</a>
            <a href="#cta" className="transition hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Log In</Link></Button>
            <Button asChild variant="hero" size="sm"><Link to="/auth?tab=signup">Get Started</Link></Button>
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
          <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: "radial-gradient(500px 280px at var(--mx, 50%) var(--my, 30%), hsl(180 100% 50% / 0.06), transparent 70%)" }} />
          <div className="pointer-events-none absolute inset-0 bg-hero" />

          <div className="container relative flex flex-col items-center px-4 py-20 text-center lg:py-32">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" /> Now in Public Beta
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
              className="max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Build Custom <br /><span className="text-gradient">Voice AI Agents</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
              Create, customize, and deploy production-ready voice assistants in minutes. Plug in any LLM, voice, or tool — and go live.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/auth?tab=signup">Start Building <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="hero-outline" size="lg"><Link to="/app"><Mic className="h-4 w-4" /> Try Live Demo</Link></Button>
            </motion.div>

            {/* Orb */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="relative mt-14 flex items-center justify-center">
              <div className="absolute h-52 w-52 rounded-full bg-primary/8 blur-3xl animate-orb-breathe" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/50 to-primary shadow-glow animate-pulse-glow" />
              <div className="absolute h-20 w-20 rounded-full bg-primary/25 blur-xl animate-orb-breathe" style={{ animationDelay: "1s" }} />
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-border/30 py-16 lg:py-24">
          <div className="container px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0} className="mb-12 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Everything You Need</h2>
              <p className="mt-3 text-sm text-muted-foreground">A complete platform for building, testing, and deploying voice AI at scale.</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                    className="rounded-xl border border-border/40 bg-card p-5 shadow-card transition-all duration-300 hover:border-primary/15 hover:shadow-glow">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-display text-sm font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-t border-border/30 py-16 lg:py-24">
          <div className="container px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0} className="mb-12 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
              <p className="mt-3 text-sm text-muted-foreground">Four steps to your first voice agent.</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                    className="rounded-xl border border-border/40 bg-card p-5 shadow-card">
                    <span className="font-display text-3xl font-bold text-primary/15">{s.num}</span>
                    <div className="mt-3 mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-display text-sm font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="border-t border-border/30 py-16 lg:py-24">
          <div className="container px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0} className="mx-auto max-w-lg text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Ready to Build?</h2>
              <p className="mt-3 text-sm text-muted-foreground">Start creating your first voice agent in under 5 minutes. No credit card required.</p>
              <div className="mt-6">
                <Button asChild variant="hero" size="lg"><Link to="/auth?tab=signup">Get Started Free <ArrowRight className="h-4 w-4" /></Link></Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/30 py-6">
        <div className="container flex flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <span className="grid h-6 w-6 place-items-center rounded bg-primary text-primary-foreground text-[10px]"><Mic className="h-3 w-3" /></span>
            VOXAI
          </div>
          <p>© {new Date().getFullYear()} VOXAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
