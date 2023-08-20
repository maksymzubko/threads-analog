import '../globals.css'
import {Inter} from 'next/font/google'
import {ClerkProvider} from "@clerk/nextjs";
import TopBar from "@/components/shared/TopBar";
import RightSidebar from "@/components/shared/RightSidebar";
import BottomBar from "@/components/shared/BottomBar";
import {ThemeProvider} from "@/components/theme-provider";
import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {router} from "next/client";
import {headers} from "next/headers";

const LeftSidebar = dynamic(() => import('@/components/shared/LeftSidebar'), {ssr: false});

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
                <div className={`w-full max-w-4xl`}>
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
