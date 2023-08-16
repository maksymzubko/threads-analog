import '../globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import {ClerkProvider} from "@clerk/nextjs";
import TopBar from "@/components/shared/TopBar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import BottomBar from "@/components/shared/BottomBar";
import {ThemeProvider} from "@/components/theme-provider";

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: "ThreadHub",
    description: "A Next.JS 13 Meta Threads App"
}

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return <ClerkProvider>
        <html lang="en">
        <body className={`${inter.className}`}>
        <TopBar/>
        <main className={"flex flex-row"}>
            <LeftSidebar/>
            <section className={"main-container"}>
                <div className={"w-full max-w-4xl"}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        {children}
                    </ThemeProvider>
                </div>
            </section>
            <RightSidebar/>
        </main>
        <BottomBar/>
        </body>
        </html>
    </ClerkProvider>
}
