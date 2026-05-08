'use client';
import { Bell, Mail, Save } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function NotificationsSettings() {
  // State quản lý Toggle
  const [emailNotifs, setEmailNotifs] = useState({
    completions: true,
    reminders: true,
    newStudents: true,
    marketing: true,
  });

  const [inAppNotifs, setInAppNotifs] = useState({
    completions: true,
    reminders: true,
    newStudents: true,
  });

  // State quản lý Radio Frequency
  const [frequency, setFrequency] = useState("immediately");

  // Helper component cho Toggle Switch - Đã cập nhật dùng biến primary
  const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={cn(
        "w-11 h-6 rounded-full transition-all duration-300 relative flex items-center cursor-pointer shadow-inner border border-transparent",
        active ? 'bg-primary border-primary/20' : 'bg-muted border-border'
      )}
    >
      <div className={cn(
        "w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
        active ? 'translate-x-6 bg-white' : 'translate-x-1 bg-background'
      )} />
    </button>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg space-y-6 transition-colors">
        
        {/* Header Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notification Preferences</h2>
          <p className="text-muted-foreground text-sm mt-1 font-medium">Choose how and when you want to be notified</p>
        </div>

        {/* 1. Email Notifications */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Email Notifications
          </h3>
          <div className="space-y-3 border-b border-border pb-5">
            {[
              { id: 'completions', title: 'Quiz Completions', desc: 'Receive notifications when students complete your quizzes' },
              { id: 'reminders', title: 'Event Reminders', desc: 'Get reminders before your scheduled quiz events' },
              { id: 'newStudents', title: 'New Student Joins', desc: 'Be notified when new students join your classes' },
              { id: 'marketing', title: 'Marketing & Updates', desc: 'Receive news, updates, and promotional emails' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                </div>
                <Toggle 
                  active={emailNotifs[item.id as keyof typeof emailNotifs]} 
                  onToggle={() => setEmailNotifs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof emailNotifs] }))} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2. In-App Notifications */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            In-App Notifications
          </h3>
          <div className="space-y-3 border-b border-border pb-5">
            {[
              { id: 'completions', title: 'Quiz Completions', desc: 'Receive notifications when students complete your quizzes' },
              { id: 'reminders', title: 'Event Reminders', desc: 'Get reminders before your scheduled quiz events' },
              { id: 'newStudents', title: 'New Student Joins', desc: 'Be notified when new students join your classes' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                </div>
                <Toggle 
                  active={inAppNotifs[item.id as keyof typeof inAppNotifs]} 
                  onToggle={() => setInAppNotifs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof inAppNotifs] }))} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Notification Frequency (Radio Buttons) */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Notification Frequency</h3>
          <div className="space-y-2">
            {[
              { id: 'immediately', label: 'Immediately' }  ,
              { id: 'daily', label: 'Daily Digest' },
              { id: 'weekly', label: 'Weekly Digest' },
            ].map((option) => (
              <label key={option.id} className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="frequency"
                    className="sr-only"
                    checked={frequency === option.id}
                    onChange={() => setFrequency(option.id)}
                  />
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all",
                    frequency === option.id 
                      ? "border-primary bg-primary/10" 
                      : "border-muted-foreground/40 group-hover:border-primary/50"
                  )} />
                  {frequency === option.id && (
                    <div className="absolute w-2.5 h-2.5 bg-primary rounded-full animate-in zoom-in-50 duration-200" />
                  )}
                </div>
                <span className={cn(
                  "text-sm transition-colors font-bold",
                  frequency === option.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button className="cursor-pointer flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-bold shadow-lg shadow-primary/20 active:scale-95">
            Save Preferences
          </button>
        </div>
      </div> 

      <p className="text-center text-xs text-muted-foreground font-medium">
        Need help with your account settings? <span className="text-primary hover:underline cursor-pointer font-bold">Contact Support</span>
      </p>
    </div>
  );
}