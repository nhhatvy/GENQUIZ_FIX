'use client';
import { useState } from "react";
import { Shield, Eye, Database, Download, Save, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PrivacySettings() {
  // Quản lý trạng thái cho các mục Privacy
  const [settings, setSettings] = useState({
    publicProfile: true,
    onlineStatus: true,
    activityHistory: true,
    analytics: true,
    personalization: true,
    cookies: true,
    exportData: false,
    deleteData: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper component cho Toggle Switch - Khớp 100% với Notifications
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
          <h2 className="text-2xl font-bold text-foreground">Privacy Settings</h2>
          <p className="text-muted-foreground text-sm mt-1 font-medium">Control your privacy and data settings</p>
        </div>

        {/* 1. Profile Visibility */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Profile Visibility
          </h3>
          <div className="space-y-3 border-b border-border pb-5">
            {[
              { id: 'publicProfile', title: 'Public Profile', desc: 'Allow others to view your profile and statistics' },
              { id: 'onlineStatus', title: 'Show Online Status', desc: 'Display when you are active on the platform' },
              { id: 'activityHistory', title: 'Activity History', desc: 'Show your quiz creation and participation history' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                </div>
                <Toggle 
                  active={settings[item.id as keyof typeof settings]} 
                  onToggle={() => toggleSetting(item.id as keyof typeof settings)} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Data Usage */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
             Data Usage
          </h3>
          <div className="space-y-3 border-b border-border pb-5">
            {[
              { id: 'analytics', title: 'Analytics & Improvements', desc: 'Allow us to collect anonymous usage data to improve the platform' },
              { id: 'personalization', title: 'Personalization', desc: 'Use your activity to personalize your experience' },
              { id: 'cookies', title: 'Cookies', desc: 'Manage cookie preferences and tracking' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                </div>
                <Toggle 
                  active={settings[item.id as keyof typeof settings]} 
                  onToggle={() => toggleSetting(item.id as keyof typeof settings)} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Data Export & Deletion */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Data Export & Deletion
          </h3>
          <div className="space-y-3">
            {[
              { id: 'exportData', title: 'Export Your Data', desc: 'Download a copy of your personal data' },
              { id: 'deleteData', title: 'Delete Your Data', desc: 'Request deletion of your personal data' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <h4 className={cn(
                    "text-sm font-bold group-hover:text-primary transition-colors",
                    item.id === 'deleteData' ? " group-hover:text-red-600" : "text-foreground"
                  )}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                </div>
                <Toggle 
                  active={settings[item.id as keyof typeof settings]} 
                  onToggle={() => toggleSetting(item.id as keyof typeof settings)} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-border">
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