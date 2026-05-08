'use client';

import { useEffect } from "react";
import { UserPlus, LogIn, Trophy, XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  isLoggedIn: boolean;
  submissionId?: string | null;
}

export default function QuizResultView({ name, totalScore, maxScore, passed, isLoggedIn, submissionId }: Props) {
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Guest: persist submissionId so it can be claimed after login/register
  useEffect(() => {
    if (!isLoggedIn && submissionId) {
      localStorage.setItem("pendingSubmissionId", submissionId);
    }
  }, [isLoggedIn, submissionId]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-1000">

        {/* Score card */}
        <div className="bg-[#18181b] border border-white/5 rounded-[4rem] p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            {passed
              ? <Trophy size={60} className="text-yellow-500 mx-auto mb-6 animate-bounce" />
              : <XCircle size={60} className="text-red-500 mx-auto mb-6" />}
            <h2 className="text-4xl font-black italic uppercase tracking-tight">
              {passed ? `Great job, ${name}!` : `Better luck next time, ${name}!`}
            </h2>
            <div className="flex justify-center items-baseline gap-2 my-4">
              <span className={cn("text-8xl font-black italic tracking-tighter", passed ? "text-primary" : "text-red-500")}>
                {pct}%
              </span>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              {totalScore} / {maxScore} points &nbsp;•&nbsp;
              <span className={passed ? "text-green-400" : "text-red-400"}>{passed ? "Passed" : "Failed"}</span>
            </p>
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        {/* CTA section — differs by login state */}
        {isLoggedIn ? (
          /* ── Already logged in: result is saved, show confirmation ── */
          <div className="space-y-4">
            <div className="bg-[#18181b] border border-green-500/20 rounded-3xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tight text-sm">Result Saved to Your Account</p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                  You can review it anytime in your progress history
                </p>
              </div>
            </div>

            <a
              href="/student"
              className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white font-black uppercase tracking-wider rounded-3xl hover:opacity-90 transition text-sm group"
            >
              Back to Dashboard
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        ) : (
          /* ── Guest: prompt to create account or sign in ── */
          <div className="space-y-4">
            <div className="text-center">
              <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Save your results so you don&apos;t lose them
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/register"
                className="flex flex-col gap-4 p-8 bg-primary text-white rounded-[2.5rem] hover:opacity-90 transition-all group shadow-xl"
              >
                <UserPlus size={32} className="group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h4 className="font-black uppercase text-lg tracking-tighter">Create New Account</h4>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Save and view analytics</p>
                </div>
              </a>

              <a
                href="/login"
                className="flex flex-col gap-4 p-8 bg-[#18181b] border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group"
              >
                <LogIn size={32} className="text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h4 className="font-black uppercase text-lg tracking-tighter text-white">Already have an account</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sign in to sync now</p>
                </div>
              </a>
            </div>

            <a
              href="/"
              className="block w-full text-center text-gray-600 hover:text-white transition text-[10px] font-black uppercase tracking-[0.3em] py-2"
            >
              Continue without saving results
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
