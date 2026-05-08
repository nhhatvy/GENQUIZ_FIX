'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle
} from "lucide-react";
import Logo from "@/app/_components/Logo";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const trimmedEmail = email.trim();
        if (!firstName.trim() || !trimmedEmail || !password || !confirmPassword) {
            setError('Please fill in all required fields');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email: trimmedEmail, password, role }),
            });
            
            const data = await res.json();
            
            if (res.ok) {
                router.push('/login?registered=true');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-[400px] bg-primary/20 blur-[120px] rounded-full" />
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
                        <h1 className="text-3xl font-bold text-black tracking-tight">Create Account</h1>
                        <p className="text-gray-500 text-sm font-medium">
                            Choose your account type and start your journey with us
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        
                        <div className="space-y-1.5 flex flex-col items-start w-full">
                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">Account Role</label>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {(['student', 'teacher'] as const).map((r) => (
                                    <label
                                        key={r}
                                        className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                                            role === r
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        } ${loading ? 'pointer-events-none opacity-50' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={r}
                                            checked={role === r}
                                            onChange={() => setRole(r)}
                                            className="sr-only"
                                            disabled={loading}
                                        />
                                        <span className={`text-sm font-bold capitalize ${role === r ? 'text-primary' : 'text-gray-700'}`}>
                                            {r === 'student' ? 'Student' : 'Teacher'}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium leading-tight">
                                            {r === 'student' ? 'Take quizzes & track progress' : 'Create quizzes & manage students'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 flex flex-col items-start">
                                <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">First Name <span className="text-red-500">*</span></label>
                                <div className="relative w-full">
                                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-black placeholder:text-gray-400"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 flex flex-col items-start">
                                <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">Last Name</label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-black placeholder:text-gray-400"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 flex flex-col items-start">
                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative w-full">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="email" 
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-black placeholder:text-gray-400" 
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 flex flex-col items-start">
                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative w-full">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 pl-11 pr-10 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-black placeholder:text-gray-400"
                                    disabled={loading}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5 flex flex-col items-start">
                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider ml-1">Confirm Password</label>
                            <div className="relative w-full">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 pl-11 pr-10 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-black placeholder:text-gray-400"
                                    disabled={loading}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer mt-4 uppercase tracking-wide disabled:opacity-50"
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 font-medium pb-8">
                        Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}