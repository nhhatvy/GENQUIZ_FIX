import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./_components/theme_provide";
import { AuthProvider } from "./_components/auth-provider";

// Giữ nguyên các khai báo font của bạn
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GenQuiz - Smart AI Quiz Platform",
  description: "Smart AI-powered quiz creation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Giữ nguyên toàn bộ className font của bạn
      className={cn(
        "h-full", 
        "antialiased", 
        geistSans.variable, 
        geistMono.variable, 
        inter.variable, 
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <head>
        <script
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
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}