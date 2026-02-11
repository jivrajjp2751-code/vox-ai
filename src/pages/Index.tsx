import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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

import robotHead from "@/assets/robot-head.png";
import frequencyWave from "@/assets/frequency-wave.png";

/* ─── Data ─── */
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
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

/* ─── Floating particles component ─── */
const Particles = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-primary/20"
        style={{
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: 0.3 + Math.random() * 0.5,
        }}
      />
    ))}
  </div>
);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Parallax transforms
  const robotY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const robotRotate = useTransform(scrollYProgress, [0, 0.5], [0, 15]);
  const robotOpacity = useTransform(scrollYProgress, [0, 0.15, 0.4], [0.15, 0.3, 0.05]);
  const waveX = useTransform(scrollYProgress, [0.1, 0.5], ["-10%", "10%"]);
  const waveOpacity = useTransform(scrollYProgress, [0.05, 0.2, 0.5, 0.7], [0, 0.25, 0.25, 0]);

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden bg-background">
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
        {/* ═══ HERO ═══ */}
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
          {/* Pointer glow */}
          <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: "radial-gradient(500px 280px at var(--mx, 50%) var(--my, 30%), hsl(180 100% 50% / 0.06), transparent 70%)" }} />
          <div className="pointer-events-none absolute inset-0 bg-hero" />

          {/* Floating robot image - parallax */}
          <motion.img
            src={robotHead}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-16 top-12 w-64 opacity-15 blur-[1px] sm:w-80 lg:w-96 lg:-right-8"
            style={{ y: robotY, rotate: robotRotate, opacity: robotOpacity }}
          />

          {/* Floating frequency wave */}
          <motion.img
            src={frequencyWave}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 w-full opacity-0"
            style={{ x: waveX, opacity: waveOpacity }}
          />

          {/* Particles */}
          <Particles />

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

            {/* Hero Orb */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="relative mt-14 flex items-center justify-center">
              <div className="absolute h-52 w-52 rounded-full bg-primary/8 blur-3xl animate-orb-breathe" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/50 to-primary shadow-glow animate-pulse-glow" />
              <div className="absolute h-20 w-20 rounded-full bg-primary/25 blur-xl animate-orb-breathe" style={{ animationDelay: "1s" }} />
            </motion.div>
          </div>
        </section>

        {/* ═══ STATS BAR ═══ */}
        <section className="border-y border-border/30 bg-card/50">
          <div className="container grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
            {[
              { val: "148M+", label: "API Calls" },
              { val: "1.5M+", label: "Assistants Built" },
              { val: "344K+", label: "Developers" },
              { val: "<300ms", label: "Avg Latency" },
            ].map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="text-center">
                <p className="font-display text-2xl font-bold text-gradient sm:text-3xl">{s.val}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="relative border-t border-border/30 py-16 lg:py-24 overflow-hidden">
          {/* Background robot floating */}
          <motion.img
            src={robotHead}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 w-72 opacity-[0.04] blur-[2px] lg:w-96"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <Particles />

          <div className="container relative px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0} className="mb-12 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Everything You Need</h2>
              <p className="mt-3 text-sm text-muted-foreground">A complete platform for building, testing, and deploying voice AI at scale.</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                    className="group rounded-xl border border-border/40 bg-card p-5 shadow-card transition-all duration-300 hover:border-primary/15 hover:shadow-glow">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary transition-transform group-hover:scale-110">
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

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="relative border-t border-border/30 py-16 lg:py-24 overflow-hidden">
          {/* Background frequency wave */}
          <motion.img
            src={frequencyWave}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 w-full opacity-[0.08]"
            animate={{ x: ["-5%", "5%", "-5%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="container relative px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0} className="mb-12 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
              <p className="mt-3 text-sm text-muted-foreground">Four steps to your first voice agent.</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                    className="group rounded-xl border border-border/40 bg-card p-5 shadow-card transition-all duration-300 hover:border-primary/15">
                    <span className="font-display text-3xl font-bold text-primary/15 transition-colors group-hover:text-primary/30">{s.num}</span>
                    <div className="mt-3 mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary transition-transform group-hover:scale-110">
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

        {/* ═══ IMMERSIVE SECTION ═══ */}
        <section className="relative border-t border-border/30 py-20 lg:py-32 overflow-hidden">
          {/* Full-screen robot background */}
          <motion.img
            src={robotHead}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] opacity-[0.06] lg:w-[700px]"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Frequency overlay */}
          <motion.img
            src={frequencyWave}
            alt=""
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-full opacity-[0.12]"
            animate={{ x: ["0%", "-8%", "0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <Particles />

          <div className="container relative px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0}
              className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent">
                <Zap className="h-3 w-3" /> Powered by AI
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                The Future of <span className="text-gradient">Voice Interaction</span>
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Build assistants that don't just respond — they understand context, take actions, and learn from every conversation.
                Connect any LLM, any voice provider, any tool.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="hero" size="lg"><Link to="/app">Open Studio <ArrowRight className="h-4 w-4" /></Link></Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section id="cta" className="relative border-t border-border/30 py-16 lg:py-24 overflow-hidden">
          <Particles />
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
