'use client';

import { 
    Mail, MapPin, Calendar, Edit2, Camera, 
    Users, Flag, BookOpen, Star, ShieldCheck, 
    ArrowUpRight, Activity, Settings, Award
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("Overview");

    const stats = [
        { label: "Total Accounts", value: "1284", trend: "+48 this month", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Active Users", value: "892", trend: "+15% this week", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Total Reports", value: "148", trend: "Resolved: 142", icon: Flag, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Total Quizzes", value: "2543", trend: "+125 this week", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* --- HEADER SECTION: Banner & Profile Info --- */}
            <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
                {/* Banner Gradient */}
                <div className="h-48 w-full bg-gradient-to-r from-[#5813C1] via-[#8B5CF6] to-[#C45037] relative">
                    <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition cursor-pointer">
                        <Camera size={18} />
                    </button>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row items-end gap-6 -mt-12 mb-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-background bg-card overflow-hidden shadow-xl">
                                <img 
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
                                    alt="Sarah Johnson" 
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 space-y-2 pb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-foreground tracking-tight">Sarah Johnson</h1>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-1.5">
                                    <ShieldCheck size={12} /> Platform Administrator
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                                <div className="flex items-center gap-1.5"><Mail size={14} /> sarah.johnson@genquiz.admin</div>
                                <div className="flex items-center gap-1.5"><MapPin size={14} /> San Francisco, CA</div>
                                <div className="flex items-center gap-1.5"><Calendar size={14} /> Joined 15/1/2020</div>
                            </div>
                        </div>


                    </div>

                    <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed font-medium">
                        System administrator with 10+ years of experience in educational platform management. 
                        Dedicated to creating a safe and efficient learning environment for all users.
                    </p>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8 pt-8 border-t border-border/50">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center md:text-left space-y-1">
                                <div className="text-2xl font-black text-foreground">{s.value}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CONTENT SECTION: Tabs & Details --- */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                
                {/* Left: Tabs & Stats Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-b border-border pb-px">
                        {["Overview", "Achievements (4)", "Activity", "Settings"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-3 text-sm font-bold transition-all relative",
                                    activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in zoom-in" />}
                            </button>
                        ))}
                    </div>

                    {/* Stats Grid Detailed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all group shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                                        <stat.icon size={24} />
                                    </div>
                                    <ArrowUpRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                                    <div className="text-3xl font-black text-foreground">{stat.value}</div>
                                    <div className={cn("text-xs font-bold", stat.color.replace('text-', 'text-'))}>{stat.trend}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: System Health & Privileges */}
                <div className="space-y-6">
                    {/* System Health Card */}
                    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-transparent p-6 shadow-sm overflow-hidden relative group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Star className="text-white fill-white" size={20} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">System Status</div>
                                    <div className="text-2xl font-black text-white">99.9%</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-tighter">
                                    <span>Platform Health</span>
                                    <span>99.9%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[99.9%] bg-white rounded-full shadow-[0_0_10px_white]" />
                                </div>
                                <div className="text-[10px] font-bold text-white/50">Uptime: 240 days</div>
                            </div>
                        </div>
                        {/* Background Glow */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>

                    {/* Admin Privileges Card */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-primary" size={20} />
                            <h3 className="font-bold text-foreground">Admin Privileges</h3>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Full System Access",
                                "User Management",
                                "Report Moderation",
                                "System Configuration"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}