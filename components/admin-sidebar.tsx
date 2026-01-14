"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, ArrowLeftRight, Shield, Bell, FileText } from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/kyc", label: "KYC Review", icon: Shield },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/reports", label: "Reports", icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          <div>
            <p className="font-bold">WalletPay</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
