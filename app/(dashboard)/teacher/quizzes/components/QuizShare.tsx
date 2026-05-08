'use client';
import { ArrowLeft, Copy, Download, Check, Share2 } from "lucide-react";
import { useState } from "react";

interface QuizShareProps {
  quizTitle: string;
  onBack: () => void;
}

export default function QuizShare({ quizTitle, onBack }: QuizShareProps) {
  const [copied, setCopied] = useState(false);
  const shareLink = "https://quizmaster.com/quizzes/q1";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-secondary rounded-lg border border-border transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Share Quiz</h2>
            <p className="text-muted-foreground text-sm">
              Share this quiz with students, colleagues, or on social media
            </p>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground/80 ml-1">Share Link</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                readOnly
                value={shareLink}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground outline-none"
              />
            </div>
            <button 
              onClick={handleCopy}
              className="p-3 bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition text-foreground"
            >
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="space-y-4 flex flex-col items-center">
          <label className="text-sm font-medium text-foreground/80 self-start ml-1">QR Code</label>
          <div className="bg-white p-8 rounded-2xl w-full max-w-[400px] aspect-[2/1] flex items-center justify-center shadow-inner">
            {/* Giả lập QR Code giống ảnh mẫu */}
            <div className="grid grid-cols-2 gap-2 text-black scale-150">
              <div className="w-8 h-8 border-[6px] border-black rounded-sm"></div>
              <div className="w-8 h-8 border-[6px] border-black rounded-sm"></div>
              <div className="w-8 h-8 border-[6px] border-black rounded-sm"></div>
              <div className="w-8 h-8 flex flex-wrap gap-1 p-1">
                 <div className="w-2 h-2 bg-black"></div>
                 <div className="w-2 h-2 bg-black"></div>
                 <div className="w-2 h-2 bg-black"></div>
                 <div className="w-2 h-2 bg-black invisible"></div>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition">
            <Download size={16} /> Download QR Code
          </button>
        </div>

        {/* Track Shares Toggle */}
        <div className="flex items-center justify-between py-4 border-t border-border">
          <div>
            <h4 className="font-medium">Track Shares</h4>
            <p className="text-xs text-muted-foreground">Get notified when someone accesses this link</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Link Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}