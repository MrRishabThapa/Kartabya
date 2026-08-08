"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  CircleCheck,
  Heart,
  Languages,
  Menu,
  MessageCircle,
  Mic2,
  PanelLeft,
  Quote,
  Rocket,
  Send,
  Sparkles,
  StickyNote,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
];

const features = [
  [Brain, "Adaptive lessons", "Content that adjusts to your pace, level, and the way you make sense of things."],
  [MessageCircle, "AI tutor", "Ask anything and get a clear explanation in words that actually click for you."],
  [Mic2, "Voice learning", "Speak your notes, hear your lessons, and keep learning with your hands free."],
  [StickyNote, "Smart sticky notes", "Capture the good stuff as you learn. Adaptiv keeps every idea organized for you."],
  [TrendingUp, "Progress tracking", "See your momentum grow with beautiful analytics built around real understanding."],
  [Languages, "Multi-language", "Learn in English, Nepali, and more with support that meets you where you are."],
] as const;

const testimonials = [
  ["AS", "Aayush Shrestha", "Computer science student", "Adaptiv makes studying feel less like a chore and more like having a really patient friend beside me."],
  ["SM", "Srijana Maharjan", "Grade 11 learner", "The explanations change when I get stuck. That small detail has made a huge difference in my confidence."],
  ["RD", "Rojan Dhakal", "Self-directed learner", "I can finally see my progress without feeling overwhelmed. It is calm, focused, and genuinely useful."],
];

const faqs = [
  ["What is Adaptiv?", "Adaptiv is an AI-powered learning platform that personalizes lessons, explanations, and practice around how you learn best."],
  ["How is this different from ChatGPT?", "ChatGPT is a general-purpose assistant. Adaptiv is built specifically for learning, with structured lessons, progress memory, adaptive difficulty, and study tools in one place."],
  ["Is my data private?", "Yes. Your learning profile and progress belong to you. We use them to personalize your experience and never sell your personal data."],
  ["Can I use Nepali?", "Yes. Adaptiv is designed for learners in Nepal and supports Nepali alongside English, with more languages on the way."],
  ["Do I need to pay?", "No. You can start for free with three lessons each day. Upgrade whenever you want more depth, voice, and analytics."],
  ["How does the AI tutor work?", "Ask a question inside a lesson and the tutor uses your context, level, and previous answers to explain the idea in a way that fits you."],
  ["Can schools sign up?", "Absolutely. Institutions can bring Adaptiv to their learners with multi-user dashboards and curriculum integration."],
  ["How do I cancel?", "You can cancel a Pro plan any time from your account. You will keep access through the end of your billing period."],
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Adaptiv home">
      <Image src="/assets/logo.png" alt="" width={compact ? 30 : 36} height={compact ? 30 : 36} className="object-contain" priority />
      {!compact && <span className="text-[1.35rem] font-extrabold tracking-[-0.05em] text-slate-800">adaptiv<span className="text-brand-primary">.</span></span>}
    </Link>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PrimaryLink({ children, href = "/onboarding", className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-flex">
      <Link href={href} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(242,121,40,0.18)] transition-colors hover:bg-brand-primary-light active:translate-y-[2px] active:border-b-0 ${className}`}>
        {children}
      </Link>
    </motion.div>
  );
}

function GhostLink({ children = "Login", href = "/auth/login", className = "" }: { children?: React.ReactNode; href?: string; className?: string }) {
  return <Link href={href} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-slate-600 transition-colors hover:border-brand-primary-tint hover:bg-brand-primary-bg hover:text-brand-primary ${className}`}>{children}</Link>;
}

function ProductMockup({ large = false }: { large?: boolean }) {
  return (
    <div className={`relative mx-auto w-full ${large ? "max-w-5xl" : "max-w-2xl"}`}>
      <div className="absolute -inset-5 rounded-[2.5rem] bg-brand-primary/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(36,50,71,0.14)]">
        <div className="flex h-10 items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-300" /><span className="h-2 w-2 rounded-full bg-amber-300" /><span className="h-2 w-2 rounded-full bg-emerald-300" /></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300">adaptiv workspace</span>
          <div className="h-5 w-5 rounded-full bg-brand-primary-bg" />
        </div>
        <div className="grid min-h-[300px] grid-cols-[56px_1fr] sm:grid-cols-[76px_1fr]">
          <aside className="border-r border-slate-100 bg-slate-50/50 p-3">
            <div className="mb-7 grid h-8 w-8 place-items-center rounded-xl bg-brand-primary text-white"><Image src="/assets/logo.png" alt="" width={22} height={22} /></div>
            {[PanelLeft, BookOpen, BarChart3, StickyNote].map((Icon, index) => <div key={index} className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${index === 1 ? "bg-brand-primary-bg text-brand-primary" : "text-slate-300"}`}><Icon size={16} /></div>)}
          </aside>
          <div className="bg-[#fffdfa] p-4 sm:p-7">
            <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">Today&apos;s lesson</p><h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-800 sm:text-2xl">How the internet works</h3><p className="mt-1 text-xs text-slate-400">Computer science · 18 min</p></div><div className="rounded-xl bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">82% ready</div></div>
            <div className="grid gap-4 lg:grid-cols-[1fr_210px]">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="mb-4 h-2 w-28 rounded-full bg-slate-100" /><div className="space-y-2.5"><div className="h-2 w-full rounded-full bg-slate-100" /><div className="h-2 w-[84%] rounded-full bg-slate-100" /><div className="h-2 w-[68%] rounded-full bg-slate-100" /></div><div className="mt-7 rounded-xl bg-brand-primary-bg p-3"><p className="text-[10px] font-bold text-brand-primary">A note from your tutor</p><p className="mt-1 text-xs leading-5 text-slate-600">Think of packets like tiny letters carrying a message across town.</p></div></div>
              <div className="rounded-2xl bg-slate-800 p-4 text-white"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-primary"><Sparkles size={14} /></div><span className="text-xs font-bold">AI tutor</span></div><p className="mt-4 text-xs leading-5 text-slate-300">Want me to explain that with an example?</p><div className="mt-5 flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-2 text-[10px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-brand-primary-light" />Ask a follow-up...</div></div>
            </div>
            <div className="mt-5 flex items-center justify-between"><div className="h-1.5 w-2/5 rounded-full bg-brand-primary-tint"><div className="h-full w-3/5 rounded-full bg-brand-primary" /></div><span className="text-[10px] font-bold text-slate-400">Lesson 3 of 5</span></div>
          </div>
        </div>
      </div>
      {!large && <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-3 -top-7 hidden rounded-2xl border border-brand-primary-tint bg-white p-3 shadow-xl sm:block"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-500"><TrendingUp size={16} /></div><div><p className="text-[10px] font-bold text-slate-400">This week</p><p className="text-sm font-extrabold text-slate-800">+24% growth</p></div></div></motion.div>}
    </div>
  );
}

export default function MarketingLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 20 });
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => setSpotlight({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <main className="landing-page overflow-hidden bg-[#FEF2EA] text-slate-800">
      <motion.div className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-brand-primary" style={{ scaleX: progress }} />
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/70 bg-[#FEF2EA]/80 px-4 py-3 shadow-[0_8px_30px_rgba(36,50,71,0.05)] backdrop-blur-xl sm:px-5">
          <Logo />
          <div className="hidden items-center gap-7 lg:flex">{navItems.map(([label, href]) => <a key={href} href={href} className="text-sm font-semibold text-slate-500 transition-colors hover:text-brand-primary">{label}</a>)}</div>
          <div className="hidden items-center gap-2 sm:flex"><GhostLink className="min-h-10 border-transparent bg-transparent px-4 py-2 text-xs" /><PrimaryLink className="min-h-10 px-4 py-2 text-xs">Get started <ArrowRight size={14} /></PrimaryLink></div>
          <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 sm:hidden">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </nav>
        <AnimatePresence>{menuOpen && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white bg-white p-3 shadow-xl sm:hidden">{navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-brand-primary-bg hover:text-brand-primary">{label}</a>)}<div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3"><GhostLink className="min-h-11 px-3 text-xs" /><PrimaryLink className="min-h-11 px-3 text-xs">Start</PrimaryLink></div></motion.div>}</AnimatePresence>
      </header>

      <section className="relative isolate flex min-h-[820px] items-center px-5 pb-16 pt-36 sm:px-8 lg:min-h-screen lg:px-12 lg:pt-32" style={{ backgroundImage: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(242,121,40,0.13), transparent 30%)` }}>
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(#d8b9a5_0.7px,transparent_0.7px)] [background-size:22px_22px]" />
        <motion.div animate={{ x: [0, 18, 0], y: [0, -12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -left-24 top-36 -z-10 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 18, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute right-[-8rem] top-24 -z-10 h-96 w-96 rounded-full bg-amber-100/80 blur-3xl" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="relative z-10"><motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }} className="max-w-2xl"><motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary-tint bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-brand-primary"><span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />Learning, but personal</motion.div><motion.h1 variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="text-[clamp(3.4rem,7vw,6.25rem)] font-extrabold leading-[0.94] tracking-[-0.075em] text-slate-800">Learn anything.<br /><span className="bg-gradient-to-r from-brand-primary to-brand-primary-dark bg-clip-text text-transparent">Adaptively.</span></motion.h1><motion.p variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="mt-7 max-w-xl text-lg leading-8 text-slate-500 sm:text-xl">Your personal AI tutor that grows with you. Lessons that meet you where you are and help you get where you&apos;re going.</motion.p><motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="mt-9 flex flex-col gap-3 sm:flex-row"><PrimaryLink>Get started <ArrowRight size={16} /></PrimaryLink><GhostLink>Login</GhostLink></motion.div></motion.div><div className="mt-8 flex items-center gap-3 text-xs font-semibold text-slate-400"><div className="flex -space-x-2">{["AS", "SM", "RD", "PK"].map((initial, i) => <span key={initial} className={`grid h-7 w-7 place-items-center rounded-full border-2 border-[#FEF2EA] text-[9px] font-extrabold text-white ${["bg-slate-700", "bg-brand-primary", "bg-amber-500", "bg-slate-400"][i]}`}>{initial}</span>)}</div><span>Made for curious learners everywhere</span></div></div>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative lg:pt-10"><ProductMockup /><div className="absolute -bottom-8 -left-7 hidden items-center gap-3 rounded-2xl border border-white bg-white/90 p-3 shadow-lg backdrop-blur sm:flex"><div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-primary-bg text-brand-primary"><CircleCheck size={18} /></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your next win</p><p className="text-sm font-extrabold text-slate-700">15 min of focused learning</p></div></div></motion.div>
        </div>
      </section>

      <section className="border-y border-[#ead8cc] bg-[#fffaf6] px-5 py-7 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-center gap-5 sm:flex-row sm:justify-between"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">A better way to grow</p><div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-extrabold tracking-tight text-slate-300 grayscale"><span>STUDENT FIRST</span><span>OPEN LEARNING</span><span>EDUVERSE</span><span>NEPAL TECH</span><span>FUTURECLASS</span></div></div></section>

      <section id="features" className="bg-[#fffaf6] px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><Reveal><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-primary">Why Adaptiv</p><h2 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-[-0.05em] text-slate-800 sm:text-5xl">A learning system that<br /><span className="text-brand-primary">learns you back.</span></h2><p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">Every learner is different. Adaptiv turns that difference into your advantage.</p></Reveal><motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon, title, description]) => <motion.article key={title} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -5 }} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:border-brand-primary-tint hover:shadow-[0_18px_35px_rgba(242,121,40,0.11)]"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-primary-bg text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white"><Icon size={21} strokeWidth={2} /></div><h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-800">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></motion.article>)}</motion.div></div></section>

      <section id="how-it-works" className="relative px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><Reveal className="text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-primary">How it works</p><h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800 sm:text-5xl">Start where you are.<br /><span className="text-slate-400">Go farther from there.</span></h2></Reveal><div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8"><div className="absolute left-[16%] right-[16%] top-7 hidden border-t border-dashed border-brand-primary-tint md:block" />{[["01", Target, "Tell us your goals", "A few thoughtful questions help us understand what you want to learn and why it matters."], ["02", BookOpen, "Start your way", "Learn through lessons, voice, notes, and conversations that fit your natural rhythm."], ["03", Rocket, "Grow with your tutor", "Your AI tutor remembers what helps and adapts every next step around your progress."]].map(([number, Icon, title, description], i) => { const StepIcon = Icon as LucideIcon; return <Reveal key={title as string} delay={i * 0.1} className="relative text-center"><div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border-4 border-[#FEF2EA] bg-brand-primary text-sm font-extrabold text-white shadow-[0_0_0_1px_#FBE0CC]">{number}</div><div className="mx-auto mt-7 grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-primary shadow-sm"><StepIcon size={21} /></div><h3 className="mt-5 text-lg font-extrabold text-slate-800">{title as string}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">{description as string}</p></Reveal>; })}</div></div></section>

      <section className="bg-[#fffaf6] px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><Reveal className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-primary">Inside Adaptiv</p><h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800 sm:text-5xl">Your whole learning<br />world, in one place.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">A calm workspace for lessons, questions, notes, and the small wins that add up.</p></Reveal><Reveal><ProductMockup large /></Reveal></div></section>

      <section id="pricing" className="px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><Reveal className="text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-primary">Simple pricing</p><h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800 sm:text-5xl">More learning.<br /><span className="text-brand-primary">Less friction.</span></h2><p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">Start free. Grow when you&apos;re ready.</p></Reveal><div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">{[["Starter", "Free", "For finding your flow", ["3 lessons per day", "Basic AI tutor", "Text-only chat", "Community support"]], ["Pro", "Rs. 999", "For serious momentum", ["Unlimited lessons", "Advanced AI tutor", "Voice input & transcription", "Notes & progress analytics", "Priority support"]], ["Institution", "Custom", "For learning communities", ["Everything in Pro", "Multi-user dashboards", "Curriculum integration", "Dedicated success manager", "SLA + SSO"]]].map(([name, price, note, items], i) => <Reveal key={name as string} delay={i * 0.08}><article className={`relative flex h-full flex-col rounded-2xl border bg-white p-7 shadow-sm ${i === 1 ? "border-2 border-brand-primary shadow-[0_16px_40px_rgba(242,121,40,0.12)]" : "border-slate-200"}`}>{i === 1 && <span className="absolute -top-3 left-6 rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Most popular</span>}<p className="text-sm font-bold text-slate-500">{name as string}</p><div className="mt-5 flex items-baseline gap-2"><span className="text-3xl font-extrabold tracking-tight text-slate-800">{price as string}</span>{i === 1 && <span className="text-sm text-slate-400">/ month</span>}</div><p className="mt-2 text-sm text-slate-400">{note as string}</p><div className="my-7 h-px bg-slate-100" /><ul className="flex-1 space-y-3">{(items as string[]).map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-600"><Check size={16} className="mt-0.5 shrink-0 text-brand-primary" />{item}</li>)}</ul><div className="mt-8">{i === 2 ? <a href="mailto:hello@adaptiv.edu.np" className="flex min-h-12 items-center justify-center rounded-xl border-2 border-slate-200 px-4 text-sm font-bold uppercase tracking-wider text-slate-600 hover:border-brand-primary-tint hover:bg-brand-primary-bg hover:text-brand-primary">Talk to us</a> : <PrimaryLink className="w-full">Get started <ArrowRight size={15} /></PrimaryLink>}</div></article></Reveal>)}</div></div></section>

      <section className="bg-[#fffaf6] px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-primary">Learner love</p><h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800 sm:text-5xl">Learning feels<br /><span className="text-brand-primary">better together.</span></h2></div><div className="flex items-center gap-2 text-sm font-semibold text-slate-400"><span className="text-brand-primary">★★★★★</span> Built with learners in Nepal</div></Reveal><div className="mt-14 grid gap-5 md:grid-cols-3">{testimonials.map(([initials, name, role, quote], i) => <Reveal key={name} delay={i * 0.08}><article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-primary-tint hover:shadow-[0_18px_35px_rgba(242,121,40,0.1)]"><Quote size={24} className="text-brand-primary-tint" /><p className="mt-5 text-base leading-7 text-slate-600">“{quote}”</p><div className="mt-7 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-brand-primary text-xs font-extrabold text-white">{initials}</div><div><p className="text-sm font-extrabold text-slate-800">{name}</p><p className="text-xs text-slate-400">{role}</p></div></div></article></Reveal>)}</div></div></section>

      <section id="faq" className="px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr]"><Reveal><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-primary">Questions, answered</p><h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800 sm:text-5xl">Everything you<br /><span className="text-brand-primary">need to know.</span></h2><p className="mt-5 max-w-sm text-lg leading-8 text-slate-500">Still curious? We&apos;re happy to help.</p><a href="mailto:hello@adaptiv.edu.np" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark">Ask us anything <ArrowRight size={15} /></a></Reveal><Reveal delay={0.1} className="space-y-2">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white px-5 py-1 shadow-sm"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-bold text-slate-700 [&::-webkit-details-marker]:hidden"><span>{question}</span><ChevronDown size={17} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pb-5 pr-8 text-sm leading-6 text-slate-500">{answer}</p></details>)}</Reveal></div></section>

      <section className="px-5 pb-24 sm:px-8 lg:pb-32"><Reveal><div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fffaf6] via-[#fbe0cc] to-[#f6b27d] px-6 py-20 text-center sm:px-12"><div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" /><div className="pointer-events-none absolute -bottom-32 -left-16 -z-10 h-72 w-72 rounded-full bg-brand-primary/20 blur-3xl" /><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-primary-dark">Your next chapter starts here</p><h2 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-[-0.06em] text-slate-800 sm:text-6xl">Ready to learn adaptively?</h2><p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-600">Join thousands of learners already growing with Adaptiv.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><PrimaryLink>Get started <ArrowRight size={16} /></PrimaryLink><GhostLink>Login</GhostLink></div></div></Reveal></section>

      <footer className="relative border-t border-slate-200 bg-white px-5 pb-8 pt-16 sm:px-8"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary-tint via-brand-primary to-brand-primary-light" /><div className="mx-auto max-w-7xl"><div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]"><div><Logo /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">A kinder, smarter way to learn. Built in Nepal for curious minds everywhere.</p><div className="mt-5 flex gap-2"><a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-xs font-extrabold text-slate-400 hover:bg-brand-primary-bg hover:text-brand-primary">ig</a><a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-xs font-extrabold text-slate-400 hover:bg-brand-primary-bg hover:text-brand-primary">x</a><a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-xs font-extrabold text-slate-400 hover:bg-brand-primary-bg hover:text-brand-primary">in</a></div></div>{[["Product", ["Features", "Pricing", "Changelog", "Roadmap"]], ["Company", ["About", "Careers", "Contact", "Partners"]], ["Resources", ["Help center", "Learning guide", "Community", "Stories"]]].map(([heading, links]) => <div key={heading as string}><p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">{heading as string}</p><div className="mt-5 space-y-3">{(links as string[]).map((link) => <a key={link} href={link === "Features" ? "#features" : "#"} className="block text-sm font-semibold text-slate-500 hover:text-brand-primary">{link}</a>)}</div></div>)}<div><p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Stay in the loop</p><p className="mt-5 text-sm leading-6 text-slate-500">Occasional notes on learning, growth, and what&apos;s new.</p><form className="mt-4 flex gap-2"><label htmlFor="newsletter" className="sr-only">Email address</label><input id="newsletter" type="email" placeholder="Your email" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint" /><button aria-label="Subscribe to newsletter" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-primary text-white hover:bg-brand-primary-light"><Send size={16} /></button></form></div></div><div className="mt-14 flex flex-col justify-between gap-3 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-400 sm:flex-row"><span>© 2026 Adaptiv. All rights reserved.</span><span className="flex items-center gap-1">Made with <Heart size={13} className="fill-brand-primary text-brand-primary" /> in Nepal.</span><div className="flex gap-4"><Link href="/privacy" className="hover:text-brand-primary">Privacy</Link><Link href="/terms" className="hover:text-brand-primary">Terms</Link></div></div></div></footer>
    </main>
  );
}
