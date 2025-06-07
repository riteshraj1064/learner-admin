import type React from "react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function TestSeriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={inter.className}>{children}</div>
}
