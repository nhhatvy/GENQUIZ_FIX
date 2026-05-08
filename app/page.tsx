'use client';
import {
  Plus, ArrowRight, Upload, Brain, BookOpen,
  Trophy, ShieldCheck, Check, X, Mail, MapPin, Phone,
  Sparkles,
  Newspaper,
  ArrowUpCircle,
  Gift,
  Users,
  Hash,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Logo from "./_components/Logo";

export default function LandingPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const handleJoin = async () => {
    const clean = pin.replace(/\D/g, "");
    if (clean.length !== 6) { setPinError("PIN must be 6 digits"); return; }
    setPinError("");
    setPinLoading(true);
    try {
      const res = await fetch(`/api/public/pin/${clean}`);
      if (!res.ok) { setPinError("Invalid or expired PIN"); return; }
      const data = await res.json();
      router.push(`/quiz-session/${data.id}`);
    } finally {
      setPinLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans selection:bg-primary/30 overflow-x-hidden">

      {/* 1. Header Navigation - Cập nhật nút Register */}
      <header className="h-16 flex items-center justify-between px-6 md:px-20 sticky top-0 bg-[#020203]/80 backdrop-blur-md z-50 border-b border-white/5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login" className="bg-white text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition">
            Sign In
          </Link>
          <Link href="/register" className="bg-gradient-to-r from-[#5813C1] to-[#C45037] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition">
            Register
          </Link>
        </div>
      </header>

      {/* 2. Hero Section - Khớp với hình ảnh */}
      <section className="relative pt-32 pb-40 px-6 min-h-[8vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute bottom-1/2 left-[-50%] w-[200%] h-[150%] opacity-[0.15]"
            style={{
              backgroundImage: `
      linear-gradient(to right, #333 1px, transparent 1px),
      linear-gradient(to bottom, #333 1px, transparent 1px)
    `,
              backgroundSize: '45px 45px',
              transform: 'perspective(1000px) rotateX(-65deg)',
              transformOrigin: 'center bottom',

              maskImage: 'linear-gradient(to top, transparent 0%, black 40%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 40%)'
            }}
          />
          <div className="absolute top-[10%] left-[-10%] w-125 h-125 bg-[radial-gradient(circle_at_center,#5813C133_0%,transparent_60%)] blur-6xl pointer-events-none" />
          <div className="absolute top-[10%] right-[-10%] w-125 h-125 bg-[radial-gradient(circle_at_center,#C4503722_0%,transparent_60%)] blur-6xl pointer-events-none" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#5813C122_0%,transparent_50%)]"
          />
        </div>

        <div className="relative z-5 max-w-8xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full  bg-white/4 ">
            <Sparkles size={16} className="text-primary" />
            <span className="text-[14px] font-medium text-gray-300 tracking-widest">
              The ultimate quiz experience
            </span>
          </div>
          <h1 className="text-6xl md:text-5xl font-bold ">
            Turn your study materials into
            <span className="bg-gradient-to-r from-[#5813C1] to-[#C45037] bg-clip-text text-transparent ">
              quizzes with AI
            </span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Upload PDFs, images, or links — our AI creates quizzes tailored to <br className="hidden md:block" /> your learning goals.
          </p>
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="bg-gradient-to-r cursor-pointer from-[#5813C1] to-[#C45037] text-white px-7 py-3.5 rounded-2xl text-l font-bold shadow-[0_0_20px_rgba(88,19,193,0.3)] hover:scale-105 transition-all active:scale-95">
              Get started
            </Link>
            {/* PIN entry */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-primary/60 transition-all">
                <Hash size={16} className="text-primary shrink-0" />
                <input
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  className="bg-transparent outline-none text-sm font-mono font-bold text-white w-36 placeholder:text-gray-500 tracking-widest"
                />
                <button
                  onClick={handleJoin}
                  disabled={pinLoading}
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary rounded-xl text-xs font-black text-white hover:opacity-90 transition disabled:opacity-60"
                >
                  {pinLoading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                  Join
                </button>
              </div>
              {pinError && <p className="text-xs text-red-400 font-medium">{pinError}</p>}
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 ">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020203] bg-gray-800 overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                    alt="student"
                  />
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm font-medium">
              <span className="text-primary font-bold ">5,000+</span> students joined this week
            </p>
          </div>
        </div>
      </section>

      {/* 3. Categories Section */}
      <section className="py-25 px-6 md:px-20 bg-[#020203]">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Badge & Title */}
          <div className="text-center space-y-5 flex flex-col items-center">

            <h2 className="text-5xl md:text-5xl font-black text-white tracking-tight">
              Explore <span className="bg-gradient-to-r from-[#5813C1] to-[#C45037] bg-clip-text text-transparent">Quiz Categories</span>
            </h2>

            <p className="text-gray-300 max-w-1xl mx-auto font-medium text-sm md:text-base leading-relaxed">
              Discover quizzes across various subjects to test and expand your knowledge
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Science & Tech", desc: "Test your knowledge in science & tech with our challenging quizzes", icon: <Brain size={22} />, color: "#3b82f6" },
              { title: "Mathematics", desc: "Test your knowledge in mathematics with our challenging quizzes", icon: <Check size={22} />, color: "#10b981" },
              { title: "Chemistry", desc: "Test your knowledge in chemistry with our challenging quizzes", icon: <Plus size={22} />, color: "#8b5cf6" },
              { title: "Biology", desc: "Test your knowledge in biology with our challenging quizzes", icon: <ShieldCheck size={22} />, color: "#ec4899" },
              { title: "General Knowledge", desc: "Test your knowledge in general knowledge with our challenging quizzes", icon: <BookOpen size={22} />, color: "#f59e0b" },
              { title: "Current Affairs", desc: "Test your knowledge in current affairs with our challenging quizzes", icon: <Newspaper size={22} />, color: "#ef4444" },
            ].map((cat, i) => (
              <div
                key={i}
                className="group relative p-5 rounded-2xl border border-white/5 bg-[#111115] hover:bg-[#16161c] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Colored border-top line */}
                <div
                  className="absolute top-0 left-0 w-full h-[7px] opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: cat.color }}
                />

                <div className="flex gap-3">
                  {/* Circular Icon with matching color bg */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    {cat.icon}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bold text-xl text-white">
                      {cat.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      {cat.desc}
                    </p>
                    <div
                      className="flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3"
                      style={{ color: cat.color }}
                    >
                      <span>Explore Quizzes</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why GenQuiz (Features) */}
      <section className="py-18 px-6 md:px-20 bg-[#020203]">
        <div className="max-w-7xl mx-auto space-y-16">

          <div className="text-center space-y-5 flex flex-col items-center">

            <h2 className="text-5xl md:text-5xl font-black text-white tracking-tight">
              Why <span className="bg-gradient-to-r from-[#5813C1] to-[#C45037] bg-clip-text text-transparent">GenQuiz</span>
            </h2>

            <p className="text-gray-300 max-w-xl mx-auto font-medium text-sm md:text-base leading-relaxed">
              Discover quizzes across various subjects to test and expand your knowledge
            </p>
          </div>

          {/* Grid Layout - Đồng bộ cấu trúc với Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                t: "Personalized Learning",
                d: "Adaptive quizzes that adjust to your knowledge level and learning pace",
                icon: <Brain size={22} />,
                color: "#8b5cf6" // Purple
              },
              {
                t: "Upload file",
                d: "Supports PDF, Word, images, links and many other formats.",
                icon: <Upload size={22} />,
                color: "#f97316" // Orange
              },
              {
                t: "Teacher Dashboard",
                d: "Comprehensive tools for educators to create and manage quizzes",
                icon: <Users size={22} />,
                color: "#3b82f6" // Blue
              },
              {
                t: "Progress Tracking",
                d: "Adaptive quizzes that adjust to your knowledge level and learning pace",
                icon: <ArrowUpCircle size={22} />,
                color: "#10b981" // Green
              },
              {
                t: "Competitive Leaderboards",
                d: "Compete with peers and climb the ranks in various categories",
                icon: <Trophy size={22} />,
                color: "#f59e0b" // Amber
              },
              {
                t: "Reward System",
                d: "Access quizzes anytime, anywhere on any device",
                icon: <Gift size={22} />,
                color: "#d946ef" // Pink/Purple
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl border border-white/5 bg-[#111115] hover:bg-[#16161c] transition-all duration-300 overflow-hidden"
              >
                {/* Viền màu 7px trên đỉnh giống Categories bạn đã sửa */}
                <div
                  className="absolute top-0 left-0 w-full h-[7px] opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: f.color }}
                />

                <div className="flex gap-4">
                  {/* Circular Icon Container */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg"
                    style={{ backgroundColor: `${f.color}15`, color: f.color }}
                  >
                    {f.icon}
                  </div>

                  {/* Text Content */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors">
                      {f.t}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {f.d}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How it works Section */}
      <section className="py-24 px-6 md:px-20 bg-black/40">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div className="text-center space-y-5 flex flex-col items-center">
            <h2 className="text-5xl font-black">How it <span className="text-primary">works?</span></h2>
            <p className="text-gray-300 max-w-xl mx-auto font-medium text-sm md:text-base leading-relaxed">
              Discover quizzes across various subjects to test and expand your knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-15 relative">
            <div className="absolute top-9 left-0 w-full h-0.5 bg-white/5 hidden md:block z-0 " />
            {[
              { n: "1", t: "Upload Your Materials", d: "Upload any study materials: PDFs, words, images, or texts." },
              { n: "2", t: "AI Analyzes the Content", d: "Our AI reads your content and creates questions tailored to your needs." },
              { n: "3", t: "Take Quizzes & Improve", d: "Practice with quizzes, get detailed feedback, and track your progress." },
            ].map((step, i) => (
              <div key={i} className="relative z-5 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white text-black text-3xl font-black flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  {step.n}
                </div>
                <h3 className="text-xl font-bold">{step.t}</h3>
                <p className="text-gray-500 text-sm font-medium">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className=" px-4 md:px-10 ">
        <div className="max-w-full mx-auto rounded-3xl bg-gradient-to-br from-primary to-[#C45037] p-12 md:p-13 overflow-hidden relative group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-5xl md:text-5xl font-black leading-tight text-white">Ready to Start Your Quiz Journey?</h2>
              <p className="text-white/80 font-medium text-lg">Join thousands of students and teachers. Sign up today and get access to all features.</p>
              <div className="flex gap-4">
                <button className="bg-white text-black px-8 py-3 rounded-xl font-black text-sm uppercase shadow-2xl transition hover:scale-105">Create Account</button>
                <button className="border-2 border-white/30 text-white px-8 py-3 rounded-xl font-black text-sm uppercase transition hover:bg-white/10">Explore Quizzes</button>
              </div>
            </div>
            <div className="w-full md:w-96 aspect-video rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-4xl font-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
              GenQuiz
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section className="py-24 px-6 md:px-20 bg-[#020203]">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white">Choose Your Plan</h2>
            <p className="text-gray-400 font-medium">Start free, upgrade when you need more power</p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">

            {/* Free Plan */}
            <div className="rounded-[2.5rem] p-8 border border-white/5 bg-[#111115] flex flex-col space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Free</h3>
                <div className="text-5xl font-black text-white">$0</div>
              </div>
              <div className="flex-1 space-y-4">
                {[
                  { t: "5 Quizzes", check: true },
                  { t: "Basic Analytics", check: true },
                  { t: "50 Student Limit", check: true },
                  { t: "Custom Branding", check: false },
                  { t: "Advanced Question Types", check: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.check ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-gray-600" />}
                    <span className={cn("text-sm font-medium", item.check ? "text-gray-300" : "text-gray-600")}>{item.t}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 rounded-2xl bg-[#0B0B0F] text-white font-bold hover:bg-white/5 transition border border-white/5 cursor-pointer">
                Current Plan
              </button>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="relative rounded-[2.5rem] p-8 border-2 border-primary bg-primary/5 flex flex-col space-y-8 shadow-[0_0_40px_rgba(88,19,193,0.15)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase px-5 py-1.5 rounded-full tracking-widest shadow-lg">
                Popular
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-white">$9.99</span>
                  <span className="text-gray-400 font-medium ml-1">/mo</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {[
                  { t: "Unlimited Quizzes", check: true },
                  { t: "Advanced Analytics", check: true },
                  { t: "500 Student Limit", check: true },
                  { t: "Custom Branding", check: true },
                  { t: "Advanced Question Types", check: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={18} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-300">{item.t}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all active:scale-95 cursor-pointer">
                Upgrade
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-[2.5rem] p-8 border border-white/5 bg-[#111115] flex flex-col space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-white">$12.99</span>
                  <span className="text-gray-400 font-medium ml-1">/mo</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {[
                  { t: "Everything in Pro", check: true },
                  { t: "Unlimited Access", check: true },
                  { t: "API Access", check: true },
                  { t: "Dedicated Support", check: true },
                  { t: "Custom Integrations", check: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={18} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-300">{item.t}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 rounded-2xl bg-[#0B0B0F] text-white font-bold hover:bg-white/5 transition border border-white/5 cursor-pointer">
                Contact Sales
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-10 px-3 md:px-20 border-t border-white/5 bg-[#0B0B0F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-500 text-sm font-medium leading-relaxed">The ultimate quiz platform for students and teachers. Learn, compete, and earn rewards.</p>
            <div className="flex gap-4 text-gray-500">
              {/* <Twitter size={20} className="hover:text-primary cursor-pointer transition"/>
               <Github size={20} className="hover:text-primary cursor-pointer transition"/>
               <Linkedin size={20} className="hover:text-primary cursor-pointer transition"/> */}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li className="hover:text-primary cursor-pointer">Home</li>
              <li className="hover:text-primary cursor-pointer">About Us</li>
              <li className="hover:text-primary cursor-pointer">Features</li>
              <li className="hover:text-primary cursor-pointer">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">For Teachers</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li className="hover:text-primary cursor-pointer">About</li>
              <li className="hover:text-primary cursor-pointer">Contact Us</li>
              <li className="hover:text-primary cursor-pointer">Careers</li>
              <li className="hover:text-primary cursor-pointer">Blog</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-foreground mb-6">Contacts us</h4>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Mail size={16} className="text-primary" /> admin@genquiz.com
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Phone size={16} className="text-primary" /> +84 123 456 789
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <MapPin size={16} className="text-primary" /> Da Nang, Viet Nam
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-bold  tracking-widest gap-4">
          <p>© 2026 GenQuiz Platform</p>
          <div className="flex gap-6">
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}