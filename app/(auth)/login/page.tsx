'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle
} from "lucide-react";
import Logo from "@/app/_components/Logo";
import { cn } from "@/lib/utils";

export default function LoginrPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(
        searchParams.get('registered') ? 'Account created successfully! Please sign in.' : ''
    );

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role) {
            router.push(`/${session.user.role.toLowerCase()}`);
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email: trimmedEmail,
                password,
                redirect: false
            });

            if (res?.error) {
                if (res.code === "AccountBanned") {
                    setError('Your account has been suspended. Contact admin to activate.');
                } else {
                    setError('Invalid email or password');
                }
            } else {
                // Đăng nhập thành công, useEffect bên trên sẽ tự động xử lý việc redirect
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">

            <div className="hidden lg:flex flex-1 relative bg-[#020203] items-center justify-center overflow-hidden border-r border-border selection:bg-primary/30">
                <div className="absolute inset-0 z-0 pointer-events-none">
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
                        <div />
                        <div className="absolute top-[10%] left-[-10%] w-125 h-125 bg-[radial-gradient(circle_at_center,#5813C133_0%,transparent_60%)] blur-6xl pointer-events-none" />
                        <div className="absolute top-[10%] right-[-10%] w-125 h-125 bg-[radial-gradient(circle_at_center,#C4503722_0%,transparent_60%)] blur-6xl pointer-events-none" />
                    </div>
                </div>
                <Link href="/" className="relative z-10 scale-[1.8] transition-transform duration-500 hover:scale-[2]">
                    <div className="bg-gradient-to-r from-[#5813C1] via-[#8B5CF6] to-[#C45037] bg-clip-text text-transparent">
                        <Logo />
                    </div>
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white h-screen overflow-y-auto scrollbar-hide">
                <div className="w-[550px] space-y-7 py-2">

                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-bold text-black tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 text-sm font-medium">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    {error && (
                        <div className={cn("px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border", error.includes('created') ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>

                        <div className="space-y-1.5 flex flex-col items-start">
                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative w-full">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-black placeholder:text-gray-400" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 flex flex-col items-start">
                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative w-full">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 pl-11 pr-10 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-black placeholder:text-gray-400"
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer mt-2 uppercase tracking-wide disabled:opacity-50"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 font-medium">
                        Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}