"use client"

import { Bell, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth-service"
import type { UserResponse } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface AppHeaderProps {
  user?: UserResponse
  unreadCount?: number
  onMenuClick?: () => void
}

export function AppHeader({ user, unreadCount = 0, onMenuClick }: AppHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await authService.logout()
    router.push("/auth/login")
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/app/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">WalletPay</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/app/notifications")}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/app/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/app/security")}>Security Center</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
