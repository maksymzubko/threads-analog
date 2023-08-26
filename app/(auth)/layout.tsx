import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'

import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata = {
  title: 'Threads',
  description: 'A Next.JS 13 Meta Threads App',
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div
            className={'w-full flex justify-center items-center min-h-screen'}
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
