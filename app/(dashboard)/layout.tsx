'use client';

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../_components/Header";
import Sidebar from "../_components/Sidebar";
import { ThemeProvider } from "../_components/theme_provide";
import { UserRole } from "@/app/constants/sidebar-routes";
import Script from "next/script";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Claim any anonymous submission made before logging in
    useEffect(() => {
        if (status !== "authenticated") return;
        const pendingId = localStorage.getItem("pendingSubmissionId");
        if (!pendingId) return;
        fetch("/api/submissions/claim", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId: pendingId }),
        }).finally(() => {
            localStorage.removeItem("pendingSubmissionId");
        });
    }, [status]);

    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const userRole = (session?.user?.role as UserRole) || "STUDENT";

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
                <Script
                    dangerouslySetInnerHTML={{
                        __html: `
                        (function() {
                            try {
                                const savedColor = localStorage.getItem('genquiz-accent');
                                if (savedColor) {
                                    document.documentElement.style.setProperty('--primary', savedColor);
                                    document.documentElement.style.setProperty('--sidebar-primary', savedColor);
                                }
                            } catch (e) {}
                        })()
                        `,
                    }}
                />
                
                <Header role={userRole} />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar role={userRole} />
                    
                    <main className="flex-1 overflow-y-auto scrollbar-hide p-6 relative">
                        <div 
                            className="absolute inset-0 z-[-1] pointer-events-none transition-all duration-700"
                            style={{ 
                                backgroundImage: `linear-gradient(to bottom right, var(--primary) 0%, black 30%, black 70%, #C4503766 100%)`,
                                opacity: 0.15 
                            }}
                        />
                        
                        <div className="relative z-10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}