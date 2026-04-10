import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ViewTabs from "@/components/ui/ViewTabs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KrackedDevs",
  description: "Mind map, team, and project board for KrackedDevs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-[var(--bg)]">
        <ViewTabs />
        {children}
      </body>
    </html>
  )
}
