import '../globals.css'
import {Inter} from 'next/font/google'
import {ClerkProvider} from "@clerk/nextjs";
import TopBar from "@/components/shared/TopBar";
import RightSidebar from "@/components/shared/RightSidebar";
import BottomBar from "@/components/shared/BottomBar";
import {ThemeProvider} from "@/components/theme-provider";
import LeftSidebar from "@/components/shared/LeftSidebar";
import {Suspense} from "react";
import LeftSidebarSkeleton from "@/components/skeletons/LeftSidebarSkeleton";
import {Toaster} from "@/components/ui/toaster";

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: "ThreadHub",
    description: "A Next.JS 13 Meta Threads App"
}

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <html lang="en">
        <body className={`${inter.className}`}>
        <TopBar/>
        <main className={"flex flex-row"}>
            <Suspense fallback={<LeftSidebarSkeleton/>}>
            <LeftSidebar/>
            </Suspense>
            <section className={"main-container"}>
                <div className={`w-full max-w-4xl`}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        {children}
                    </ThemeProvider>
                </div>
            </section>
            <RightSidebar/>
        </main>
        <BottomBar/>
        <Toaster />
        </body>
        </html>
    </ClerkProvider>
}
