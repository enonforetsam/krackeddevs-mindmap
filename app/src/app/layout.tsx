import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ViewTabs from "@/components/ui/ViewTabs"
import ThemePicker from "@/components/ui/ThemePicker"

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
        <div style={{
          position: 'fixed', top: 14, right: 14, zIndex: 999,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 500, color: 'var(--brand-c)',
            letterSpacing: '.06em', opacity: 0.5,
          }}>
            KrackedDevs.com
          </div>
          <ThemePicker />
        </div>
        {children}
      </body>
    </html>
  )
}
